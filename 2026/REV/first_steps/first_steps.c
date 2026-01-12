#include <stdio.h>
#include <malloc.h>
#include <string.h>

const char* author = "Challenge Authored by @s0s.sh - https://s0s.sh/";

const char* flag = "RUSEC{well_th4t_was_eZ_WllwnZMjMCjqCsyXNnrtpDomWMU}";

int main(void) {
	puts("I was up late last night exploring the .rodata section, but I seem to have lost my flag!\n");
	puts("I'm sure it's around here somewhere... Can you find it for me? <3");

	int flag_len = strlen(flag);

	char* definitely_not_the_flag = (char*) malloc(flag_len + 1);
	strncpy(definitely_not_the_flag, flag, strlen(flag));
	definitely_not_the_flag[flag_len] = 0;

	free(definitely_not_the_flag);

	return 0;
}
