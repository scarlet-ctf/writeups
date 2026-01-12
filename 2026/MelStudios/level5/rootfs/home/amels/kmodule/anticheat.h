#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/proc_fs.h>
#include <linux/sprintf.h>
#include <linux/types.h>
#include <linux/fs.h>
#include <linux/sched.h>
#include <linux/uaccess.h>
#include <linux/ftrace.h>
#include <linux/list.h>
#include <linux/kprobes.h>
#include <linux/kallsyms.h>
#include <linux/xarray.h>
#include <linux/slab.h>
#include <linux/seq_file.h>
#include <linux/sched/signal.h>
#include <linux/signal.h>
#include <linux/pid.h>
#include <linux/file.h>
#include <linux/fs.h>
#include <linux/fdtable.h>
#include <linux/spinlock.h>
#include <linux/sched/task.h>
#include <linux/cleanup.h>
#include <linux/stat.h>
#include <linux/compiler.h>
#include <uapi/linux/fs.h>
#include <linux/minmax.h>

# define BLOCK_FD _IO(69, 0)
# define LOCK_SECRET _IO(69, 1)
# define KPROBE_SECURITY_CHECK _IO(69, 2)

# define MAX_FD_TO_BLOCK 20

# define SECRET_SIZE 0x50

extern struct xarray active_anticheats;
typedef struct anticheat_blk {
	int blocking_fd[MAX_FD_TO_BLOCK];
	int secret_locked;
	unsigned char secret[SECRET_SIZE];
} anticheat_blk;

extern struct kmem_cache *anticheat_cache;

anticheat_blk *find_blk_for_pid(void);
long fd_valid(int fd);
anticheat_blk *get_blk_if_safe(size_t *num, loff_t *offset);

int anticheat_status(struct seq_file *m, void *v);

loff_t secret_seek(struct file *file, loff_t new_offset, int whence);
ssize_t secret_read(struct file *file, char __user *buf, size_t num, loff_t *offset);
ssize_t secret_write(struct file *file, const char __user *buf, size_t num, loff_t *offset);
long interact_anticheat(struct file *file, unsigned int cmd, unsigned long arg);
int open_anticheat(struct inode *inode, struct file *file);
int close_anticheat(struct inode *inode, struct file *file);

int kprobe_security_check(void);
int kprobe_close(struct kprobe *p, struct pt_regs *regs);
int kprobe_read(struct kprobe *p, struct pt_regs *regs);
int set_probes(int status);

void __exit stop(void);
int __init initialization(void);