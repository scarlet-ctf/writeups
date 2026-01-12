int pow(int a, int b) {
    int res = 1;

    while (b > 0) {
        res *= a;
        b--;
    }

    return res;
}

int main() {
	char test[256];
	test[118] = 201;
	char flag[36];
	for(int i = 0; i < 36; i++) {
		char c = readchar();
		if(c == '\n') {
			i = 31;
		}else{
			flag[i] = c;
			printchar(flag[i]);
		}
	}
	test[5] = 248;
	printchar('\n');

	test[8] = 94;
	char k[36] = "ekpSZQqLHHu9OS9uhsrQ9GALcGsWam49Dhqh";
	test[44] = 116;
	for(int i = 0; i < 36; i++) {
		flag[i] ^= k[i];
	}

	test[6] = 155;
	char d[36] = "ymj9VFujlwhC7M1Y2KBnubLFBGWRtPN2wr6x";
	test[48] = 135;
	char d2[36] = "6sMdw5DbVgYx5I6H0N4XVL04rPKEtzyogfuY";
	for(int i = 0; i < 36; i++) {
		d[i] ^= d2[i];
	}

	test[2] = 225;
	char y[36] = "TiL2ZCKYjBo0KyzPeyV3aXSv8fFNUKiFpxhC";
	test[155] = 8;
	char y1[36] = "ufRNlIUO2BBhxh6P9auALbqPB6wiIGUWwdQF";
	test[214] = 57;
	for(int i = 0; i < 36; i++) {
		flag[i] ^= (y[i]^y1[i])&d[i];
	}

	test[5] = 252;
	int result[36] = {54, 48, 37, 74, 57, 40, 6, 124, 52, 23, 61, 76, 18, 32, 13, 42, 27, 67, 34, 17, 97, 50, 7, 1, 33, 8, 23, 56, 80, 22, 95, 88, 112, 21, 30, 20};
	test[19] = 125;
	int score = 0;
	test[21] = 51;
	for(int i = 0; i < 36; i++) {
		if(flag[i] != result[i]) {
			score = 1;
		}
	}

	test[67] = 212;
	if(score == 0) {
		print("Flag is correct!! :D");
	}else {
		print("Flag is incorrect...");
	}

	test[54] = 245;
	return 0;
}