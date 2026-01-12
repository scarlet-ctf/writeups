#include "anticheat.h"

// the data structure holding a mapping between PID -> anticheat_blk
struct xarray active_anticheats;

// return the anticheat_blk for the current PID
anticheat_blk *find_blk_for_pid(void) {
	unsigned long pid = (unsigned long)current->pid;
	void *found = xa_find(&active_anticheats, &pid, pid, XA_PRESENT);

	if(found == NULL) return NULL;
	else return (anticheat_blk*)found;
}

// FDs that are stdout, stdin, and stderr are not valid to block
long fd_valid(int fd) {
	return (fd > 2);
}

// try and prevent OOB/reading the secret when not supposed to
// mainly for reading/writing
anticheat_blk *get_blk_if_safe(size_t *num, loff_t *offset) {
	// get block, it is unsafe if not found or if the secret is locked
	anticheat_blk *found = find_blk_for_pid();
	if(found == NULL || found->secret_locked) return NULL;

	// protect against OOB
	if(*offset + *num > SECRET_SIZE) {
		*num = min(SECRET_SIZE, (size_t)(SECRET_SIZE - *offset));
	}

	// do nothing if reading/writing no bytes
	if(*num == 0) return NULL;

	// done!!
	return found;
}