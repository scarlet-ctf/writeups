#include "anticheat.h"

# define NUM_KPROBES 2
static struct kprobe probes[] = {
	{
		.symbol_name = "ksys_read",
		.pre_handler = kprobe_read
	},
	{
		.symbol_name = "file_close_fd_locked",
		.pre_handler = kprobe_close
	}
};

// check to see if we missed some FDs
int kprobe_security_check(void) {
	unsigned long missed = probes[0].nmissed;
	probes[0].nmissed = 0;
	return missed == 0;
}

// whenever an FD is closed, register it
// if an anticheated process is blocking it, release it; it's no longer valid for that proc
int kprobe_close(struct kprobe *p, struct pt_regs *regs) {
	anticheat_blk *blk = find_blk_for_pid();
	if(blk == NULL) return 0;

	// get the fd (it's in register RSI)
	// if it exists, set it to 0 (invalid/default)
	unsigned long fd = regs->si;
	for(int i = 0; i < MAX_FD_TO_BLOCK; i++) {
		if(blk->blocking_fd[i] == (int)fd) {
			blk->blocking_fd[i] = 0;
		}
	}

	// done!
	return 0;
}

// block reading of a forbidden FD
int kprobe_read(struct kprobe *p, struct pt_regs *regs) {
	anticheat_blk *blk = find_blk_for_pid();
	if(blk == NULL) return 0;

	// check to see if the FD is blocked
	int reading_fd = (int)(regs->di);
	for(int i = 0; i < MAX_FD_TO_BLOCK; i++) {
		// get the current FD, ignore if invalid
		int fd = blk->blocking_fd[i];
		if(!fd_valid(fd)) continue;

		// is this FD a match?
		// if so, change the number of bytes to read to 0
		if(reading_fd == fd) {
			regs->dx = 0;
			return 0;
		}
	}

	// done!
	return 0;
}

// activate/deactivate kprobes
int set_probes(int status) {
	for(int i = 0; i < NUM_KPROBES; i++) {
		if(status) {
			int res = register_kprobe(&probes[i]);
			if(res != 0) {
				pr_alert("Failed initializing kprobe %d!\n", i);
				return -1;
			}
		}else{
			unregister_kprobe(&probes[i]);
		}
	}

	return 0;
}