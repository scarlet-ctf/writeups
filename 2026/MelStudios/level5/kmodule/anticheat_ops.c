#include "anticheat.h"

// lseeking ability for secret
loff_t secret_seek(struct file *file, loff_t new_offset, int whence) {
	loff_t current_pos = file->f_pos;
	loff_t new_pos = new_offset;

	// calculate the new positions
	switch(whence) {
	case SEEK_SET:
		new_pos = new_offset;
		break;
	case SEEK_CUR:
		new_pos = min((size_t)(current_pos+new_offset), SECRET_SIZE);
		break;
	case SEEK_END:
		new_pos = SECRET_SIZE;
		break;
	}

	// done!
	file->f_pos = new_pos;
	return new_pos;
}

// read anticheat secret
ssize_t secret_read(struct file *file, char __user *buf, size_t num, loff_t *offset) {
	anticheat_blk *blk = get_blk_if_safe(&num, offset);
	if(blk == NULL) return 0;

	// get the bytes read
	unsigned long bytes_not_read = copy_to_user(buf, blk->secret + *offset, num);
	unsigned long read = num-bytes_not_read;

	// advance the offset
	*offset += read;

	// are we at the end of file? return 0
	// otherwise, return what we read
	if(*offset == SECRET_SIZE) return 0;
	else return read;
}

// write to anticheat secret
ssize_t secret_write(struct file *file, const char __user *buf, size_t num, loff_t *offset) {
	anticheat_blk *blk = get_blk_if_safe(&num, offset);
	if(blk == NULL) return 0;

	// write the secret
	// get the number of bytes written
	unsigned long not_copied = copy_from_user(blk->secret + *offset, buf, num);
	unsigned long written = num-not_copied;

	// advance the offset, and return
	*offset += written;
	return written;
}

// interact with anticheat
long interact_anticheat(struct file *file, unsigned int cmd, unsigned long arg) {
	// get the block device
	anticheat_blk *blk = find_blk_for_pid();
	if(blk == NULL) return -EINVAL;

	// check the command
	switch(cmd) {
	case BLOCK_FD:
		// get the file descriptor provided to block
		// if it's invalid, fail
		if(!fd_valid(arg)) return -EBADF;

		// check if FD is already within the array
		// if so, do nothing
		for(int i = 0; i < MAX_FD_TO_BLOCK; i++) {
			if(blk->blocking_fd[i] == (int)arg) return 0;
		}

		// look for a place to set the FD
		for(int i = 0; i < MAX_FD_TO_BLOCK; i++) {
			// get the current FD
			int fd = blk->blocking_fd[i];
			if(fd_valid(fd)) continue; // don't overwrite valid FDs!

			// since the FD isn't valid, we can overwrite it
			blk->blocking_fd[i] = (int)arg;
			return 0;
		}

		// no spots; couldn't set FD
		return -EBUSY;

	case LOCK_SECRET:
		blk->secret_locked = 1;
		return 0;

	case KPROBE_SECURITY_CHECK:
		// ENOMEM on failure because kprobes fail from low resources
		return (kprobe_security_check()) ? 0 : -ENOMEM;
	}

	return -EINVAL;
}

// start tracking process w/ anticheat
int open_anticheat(struct inode *inode, struct file *file) {
	// check if the process ID exists
	// if it does, fail (can only have 1 anticheat open at the same time)
	if(find_blk_for_pid() != NULL) return -EPERM;

	// construct the block, zero everything out
	anticheat_blk *blk = kmem_cache_zalloc(anticheat_cache, GFP_KERNEL);
	if(blk == NULL) return -ENOMEM;

	// attempt to store
	// get the error code, if it's not 0, then return the error and free the block
	void *ret = xa_store(&active_anticheats, (unsigned long)current->pid, blk, GFP_KERNEL);
	int err = xa_err(ret);
	if(err != 0) {
		kmem_cache_free(anticheat_cache, blk);
		return err;
	}

	// success! we added anticheat information for the pid
	return 0;
}

// stop tracking process w/ anticheat
int close_anticheat(struct inode *inode, struct file *file) {
	// get the anticheat block
	// if it's NULL, just ignore; nothing to remove and we finished cleanup
	anticheat_blk *blk = find_blk_for_pid();
	if(blk == NULL) return 0;

	// perform cleanup
	xa_erase(&active_anticheats, (unsigned long)current->pid);
	kmem_cache_free(anticheat_cache, blk);

	// kill process
	// anticheat cannot be disabled willy-nilly (for security reasons)
	struct pid *pid_strct = find_get_pid(current->pid);
	if(kill_pid(pid_strct, SIGKILL, 0) != 0) {
		pr_alert("Failed to kill process %d!\n", current->pid);
	}

	// done
	return 0;
}

// function to show anticheat status
int anticheat_status(struct seq_file *m, void *v) {
	// the banner
	seq_printf(m, "Amels-Anticheat v1\n");

	// print the processes using anticheat
	long unsigned int idx;
	void *entry;
	int process_count = 0;
	xa_for_each(&active_anticheats, idx, entry) {
		// increment process count, send the header if not sent already
		if(process_count == 0) {
			seq_printf(m, "Processes currently using anticheat:\n");
		}
		process_count++;

		// get the anticheat block
		anticheat_blk *blk = (anticheat_blk*)entry;

		// get the task_struct from PID
		struct pid *pid_strct = find_get_pid(idx);
		struct task_struct *task = pid_task(pid_strct, PIDTYPE_PID);

		// print out general information
		seq_printf(m,
			" * %s [%lu]\n",
			task->comm, idx
		);

		// print out blocked FDs
		seq_printf(m, "  [!] FDs Blocked: ");
		for(int i = 0; i < MAX_FD_TO_BLOCK; i++) {
			// get FD, print if valid
			int fd = blk->blocking_fd[i];
			if(fd_valid(fd)) seq_printf(m, "%d ", fd);
		}
		seq_printf(m, "\n");
	}

	// print total processes using anticheat
	seq_printf(m, "%d total\n", process_count);

	//done
	return 0;
}