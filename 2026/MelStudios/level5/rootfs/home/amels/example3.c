#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	// cant use multiple anticheats
	int fd1 = open("/proc/anticheat", 0, 2);
	int fd2 = open("/proc/anticheat", 0, 2);

	printf("FD1 = %d\nFD2 = %d\n", fd1, fd2);

	// close it
	// this will kill the process!
	close(fd1);

	// this won't print! anticheat is closed!
	puts("we're still here!");
	return 0;
}