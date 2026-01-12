#include "anticheat.h"

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Amels-Anticheat [WIP]");
MODULE_AUTHOR("Mel Studios");

// anticheat devices (status and handle)
static struct proc_dir_entry *anticheat = NULL;
static struct proc_dir_entry *anticheat_status_dev = NULL;

// memory
struct kmem_cache *anticheat_cache = NULL;

// operations for the anticheat device
static struct proc_ops anticheat_ops = {
	.proc_ioctl = interact_anticheat,
	.proc_open = open_anticheat,
	.proc_release = close_anticheat,
	.proc_read = secret_read,
	.proc_write = secret_write,
	.proc_lseek = secret_seek
};

int __init initialization(void) {
	// create device for anticheat
	anticheat = proc_create("anticheat", S_IRUGO|S_IWUGO, NULL, &anticheat_ops);
	if(anticheat == NULL) {
		pr_alert("Error creating anticheat handle\n");
		return -1;
	}

	// create anticheat status device
	anticheat_status_dev = proc_create_single("anticheat-status", S_IRUGO|S_IWUGO, NULL, anticheat_status);
	if(anticheat_status_dev == NULL) {
		pr_alert("Error creating anticheat status\n");
		return -1;
	}

	// create memory cache
	anticheat_cache = kmem_cache_create("anticheat-cache", sizeof(anticheat_blk), 0, 0, NULL);
	if(anticheat_cache == NULL) {
		pr_alert("Error creating anticheat kalloc cache\n");
		return -1;
	}

	// initialize kprobes
	if(set_probes(1) == -1) {
		return -1;
	}

	// initialize anticheats array
	xa_init(&active_anticheats);

	// we're done
	pr_alert("Amels-Anticheat Online!\n");
	return 0;
}

void __exit stop(void) {
	// free devices
	proc_remove(anticheat);
	proc_remove(anticheat_status_dev);

	// cleanup
	kmem_cache_destroy(anticheat_cache);
	set_probes(0);
	xa_destroy(&active_anticheats);

	// done
	pr_alert("Amels-Anticheat Offline!\n");
}

module_init(initialization);
module_exit(stop);