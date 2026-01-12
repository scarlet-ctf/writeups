#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <unistd.h>

#define NUMBER_USERS 2
#define NAME_SIZE 0x20
#define NETID_SIZE 0x40

typedef void ruid_func(void);
typedef struct {
	char name[NAME_SIZE];
	ruid_func* func;
	unsigned long ruid;
} RUID_User;

RUID_User users[NUMBER_USERS];

typedef struct {
	char* name;
	char* netid;
	double gpa;
} Student;
Student students[] = {
	{"Mel", "lois4444", 4.0},
	{"ilyree", "webSUCKS1111", 2.5},
	{"petrichor", "girlypop9182", 4.0},
	{"boardbot", "kitty2003", 0.1},
	{"Talon", "rivals6969", 0},
	{"glqce", "proudrusecpresident1984", 1}
};

void list_ruids() {
	putchar('\n');
	for(int i = 0; i < NUMBER_USERS; i++) {
		printf("[%d] {RUID REDACTED} %s\n", i, users[i].name);
	}
	putchar('\n');
}

int get_number(unsigned int* num, unsigned int bound) {
	printf("Num: ");
	unsigned int idx;
	scanf("%u%*c", &idx);
	if(idx >= bound) {
		puts("Student doesn't exist!");
		return 0;
	}

	*num = idx;
	return 1;
}

void prof() {
	puts("Change a student's GPA!");
	puts("Students:");
	for(int i = 0; i < sizeof(students)/sizeof(Student); i++) {
		printf("[%d] %s (NetID %s) %.1f\n", i, students[i].name, students[i].netid, students[i].gpa);
	}

	unsigned int idx;
	if(get_number(&idx, sizeof(students)/sizeof(Student)) == 0) {
		return;
	}

	double gpa = 100;
	while(gpa > 4 || gpa <= 0) {
		printf("GPA: ");
		scanf("%lf%*c", &gpa);
	}

	students[idx].gpa = gpa;
	printf("GPA of %s now changed to %.1f!\n", students[idx].name, students[idx].gpa);
}

void dean() {
	puts("Change a staff member's name!");

	list_ruids();
	unsigned int idx;
	if(get_number(&idx, NUMBER_USERS) == 0) {
		return;
	}

	//intentionally vulnerable overflow vuln here, we can modify ruid_func
	//add 1 because of newline char
	printf("New name: ");
	read(0, users[idx].name, NAME_SIZE+sizeof(ruid_func*)+1);
}

void setup_users() {
	char* names[] = {
		"Professor",
		"Dean"
	};
	ruid_func* funcs[] = {
		&prof,
		&dean
	};
	for(int i = 0; i < NUMBER_USERS; i++) {
		strcpy(users[i].name, names[i]);
		users[i].ruid = (unsigned long)rand();
		users[i].func = funcs[i];
	}
}

int main() {
	setbuf(stdout, NULL);
	setbuf(stdin, NULL);
	setup_users();

	puts("Welcome to Rutgers University!");

	// this is where they can put their netid
	// we do it here so the stack address remains permanent and unchanged
	printf("Please enter your netID: ");
	char netid[NETID_SIZE] = {0};
	read(0, netid, NETID_SIZE);
	netid[strcspn(netid, "\n")] = 0;
	printf("Accessing secure interface as netid '%s'\n", netid);

	unsigned long ruid;
	int found = 0;
	while(!feof(stdin)) {
		list_ruids();

		printf("Please enter your RUID: ");
		scanf("%lu%*c", &ruid);

		printf("Logging in as RUID %lu..\n", ruid);
		found = 0;
		for(int i = 0; i < NUMBER_USERS; i++) {
			if(users[i].ruid == ruid) {
				putchar('\n');

				printf("Welcome, %s!\n", users[i].name);
				users[i].func();
				putchar('\n');

				found = 1;
			}
		}

		if(!found) {
			puts("No match!");
		}
	}
}