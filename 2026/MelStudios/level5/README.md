Reference `exploit.c`

This is essentially just:
* Vulnerable kernel driver allowing for OOB `anticheat-cache` write/read, via the vulnerable `lseek` handler (it just arbitrarily sets the offset)
* Userland SUID binary (runs as root)
* Utilize heap OOB write + heap grooming on both attacker process AND SUID process to:
	* From attacker process, modify memory of kheap structure for victim SUID process (to turn off the secret protection)
	* Force a BOF from the kernel onto the userland SUID process and perform a `ret2win`
    	* Do this by using the vulnerable `lseek` *on the SUID process aswell* to have it read into a buffer the FD array of the next chunk (which our attacker process will fork and also create)
        * It will have a BOF triggered, despite a safe `num_bytes` called from the SUID process, since the driver will force `MAX_SIZE`.
        * Set FD array to a proper payload that, when exploited with the OOB, will overwrite the return address after `ret` to the function which reads the flag
        * Win!

Along with all this, the kernel has the following heap protections:

```
#
# Slab allocator options
#
CONFIG_SLUB=y
CONFIG_KVFREE_RCU_BATCHED=y

# CONFIG_SLAB_MERGE_DEFAULT is not set
# CONFIG_SLAB_FREELIST_RANDOM is not set

CONFIG_SLAB_FREELIST_HARDENED=y

# CONFIG_SLAB_BUCKETS is not set
# CONFIG_SLUB_STATS is not set

CONFIG_SLUB_CPU_PARTIAL=y
CONFIG_RANDOM_KMALLOC_CACHES=y

# end of Slab allocator options
```

`CONFIG_SLAB_FREELIST_RANDOM` being false means we can perform the OOB since the chunks will be sequential in memory, all others are just to make it harder to perform genuine heap exploitation (like against the freelist), other structs (the custom `anticheat-cache` and `CONFIG_RANDOM_KMALLOC_CACHES`), etc.
