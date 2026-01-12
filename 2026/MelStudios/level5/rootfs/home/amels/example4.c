#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main() {
	// cant open multiple anticheats
	int acs[2];
	for(int i = 0; i < 2; i++) {
		acs[i] = open("/proc/anticheat", 0, 2);
		printf("open() result: %d\n", acs[i]);
	}

	// done!
	return 0;
}