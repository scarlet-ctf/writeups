#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <assert.h>
#include <sys/time.h>

#define BLOCK_FD _IO(69, 0)

// show anticheat status
void show_status() {
	puts("");
	system("cat /proc/anticheat-status");
	puts("");
}

// perform a test read (success or fail expected)
void test_read(int fd, int success) {
	char test[0x5];
	size_t num = read(fd, test, 0x5);
	size_t expected = (success) ? 0x5 : 0;
	if(num != expected) {
		printf("num was %d, expected %d\n", num, expected);
		exit(-1);
	}else {
		printf("success; read %d bytes from FD=%d\n", num, fd);
	}
}

int main() {
	// start the anticheat
	int ac = open("/proc/anticheat", 0, 2);

	// open a file, any file
	int fd = open("/etc/passwd", 0, 2);

	// perform an initial read
	test_read(fd, 1);

	// block the file descriptor, and try again
	// we'll read no bytes because the FD is now forbidden!
	long ret = ioctl(ac, BLOCK_FD, fd);
	printf("ioctl=%d\n", ret);
	test_read(fd, 0);

	show_status();

	// create a new fd and perform the first read
	int fd2 = open("/etc/group", 0, 2);
	test_read(fd2, 1);

	// protect it, we can have multiple files protected!
	ret = ioctl(ac, BLOCK_FD, fd2);
	test_read(fd2, 0);
	printf("ioctl=%d\n", ret);

	show_status();

	// now, close the original fd
	printf("Closed first FD (%d)\n", fd);
	close(fd);
	show_status();

	// we're done!
	return 0;
}