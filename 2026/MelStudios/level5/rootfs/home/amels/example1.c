#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/ioctl.h>
#include <assert.h>
#include <string.h>

#define BLOCK_FD _IO(69, 0)
#define LOCK_SECRET _IO(69, 1)
#define KPROBE_SECURITY_CHECK _IO(69, 2)
#define BUF_SIZE 10

#define SECRET_SIZE 0x50

#define FLAG_SIZE 0x69

void test() {
	// debug mode
	int fd = open("/flag.txt", O_RDWR, 2);
	if(fd == -1) {
		perror("Error opening");
		exit(-1);
	}

	char data[FLAG_SIZE] = {0};
	int num_read = read(fd, data, FLAG_SIZE);
	if(num_read == -1) {
		perror("Failure to read flag");
		exit(-1);
	}

	puts(data);
}

char *file = "/etc/passwd";
int main() {
	// try to get root perms
	int res = setuid(0);
	if(res == -1) {
		perror("setting perms");
		return -1;
	}

	//test();

	// try to open anticheat
	int ac = open("/proc/anticheat", O_RDWR, 2);
	if(ac == -1) {
		perror("Opening anticheat");
		return -1;
	}
	
	// open the test file
	int test_fd = open(file, O_RDWR, 2);
	if(test_fd == -1) {
		perror("Opening file");
		return -1;
	}

	// block the file from being read
	res = ioctl(ac, BLOCK_FD, test_fd);
	if(res != 0) {
		perror("Blocking file descriptor");
		return -1;
	}

	// read from the file, then close
	char data[BUF_SIZE] = {0};
	int num = read(test_fd, data, BUF_SIZE);
	printf("Read %d from file\n", num);
	close(test_fd);

	// before marking success, check that the kprobes haven't failed
	res = ioctl(ac, KPROBE_SECURITY_CHECK, 0);
	if(res != 0) {
		puts("possible KPROBE failures! halting!");
		return -1;
	}

	// store the data (only thing remaining) as a secret
	int write_res = write(ac, data, num);
	if(write_res == -1) {
		perror("Writing");
		return -1;
	}
	printf("Wrote %d bytes to secret\n", write_res);

	// lock it and, for security, zero out the read data
	memset(data, 0, BUF_SIZE);
	res = ioctl(ac, LOCK_SECRET, 0);
	if(res != 0) {
		perror("Locking secret");
		return -1;
	}

	// get what idx of the secret we should read out
	int num_to_seek = 0;
	printf("What part of the secret would you like to view? ");
	scanf("%d", &num_to_seek);

	// seek the proper amount
	off_t amnt = lseek(ac, num_to_seek, SEEK_SET);
	printf("Went to offset %u\n", amnt);

	// read it out (it will fail because of the secret being locked)
	int read_res = read(ac, data, num);
	if(read_res == -1) {
		perror("Reading the secret");
		return -1;
	}
	printf("Read %d of the secret\n", read_res);

	// :D
	printf("Here's something SUPER cool: %p\n", __builtin_return_address(0));
	fflush(stdout);

	// done!!
	return 0;
}