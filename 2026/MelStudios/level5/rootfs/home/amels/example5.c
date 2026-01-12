#include <stdio.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
#include <signal.h>
#include <string.h>
#include <assert.h>
#include <stdlib.h>
#include <sys/stat.h>

# define LOCK_SECRET _IO(69, 1)

size_t try_write(int ac, char *secret) {
	int write_res = write(ac, secret, strlen(secret)+1);
	if(write_res == -1) {
		perror("writing");
		exit(-1);
	}
	return (size_t)write_res;
}

size_t try_read(int ac, char *secret) {
	int read_res = read(ac, secret, 10);
	if(read_res == -1) {
		perror("reading");
		exit(-1);
	}
	return (size_t)read_res;
}

int main() {
	// open the anticheat
	int ac = open("/proc/anticheat", O_RDWR, 2);

	// read and store our secret!
	// write the length of the string plus 1 (null term)
	char *secret = "yolo!";
	size_t write_res = try_write(ac, secret);
	printf("wrote %u of secret: %s\n", write_res, secret);

	// rewind back to offset 0
	lseek(ac, 0, SEEK_SET);

	// print it out
	char read_secret[10];
	size_t num = try_read(ac, read_secret);
	printf("read %u of secret: %s\n", num, read_secret);

	// rewind again, and LOCK IT!
	lseek(ac, 0, SEEK_SET);
	int ioctl_res = ioctl(ac, LOCK_SECRET, 0);
	if(ioctl_res != 0) {
		perror("locking secret");
		exit(-1);
	}

	// try to read again
	memset(read_secret, 0, 10);
	num = try_read(ac, read_secret);
	printf("read %u of secret: %s\n", num, read_secret);

	// done!
	return 0;
}