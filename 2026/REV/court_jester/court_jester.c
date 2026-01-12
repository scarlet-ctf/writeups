#include <stdio.h>
#include <signal.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>

#include "consts.h"


/* pseudocode description of challenge logic */

//	for k in range(0..3)
//		parent passes f1[k] to child proc via pipe
//		child xor decrypts with keys[k] and sends back to parent
//		parent reads decrypted bytes into dump
//	solver must manually xor resultant bufs with ko


const char* author = "Challenge Authored by @s0s.sh - https://s0s.sh/";


int main()
{
	int c2p_pipe_fd[2];
	int p2c_pipe_fd[2];
	pid_t pid;


	printf("\e[1;1H\e[2J");
	puts(ascii_joker);

	if (pipe(c2p_pipe_fd) == -1) {
		exit(EXIT_FAILURE);
	}

	if (pipe(p2c_pipe_fd) == -1) {
		exit(EXIT_FAILURE);
	}

	if (signal(SIGCHLD, SIG_IGN) == SIG_ERR) {
		exit(EXIT_FAILURE);
	}

	pid = fork();

	switch (pid) {
		case -1:
			exit(EXIT_FAILURE);
		case 0: {
			/* child process */

			uint8_t* buf;
			uint8_t* buf_redherring;

			const uint8_t keys[3][2] = {
				{0xca, 0xb1},
				{0xd6, 0xc9},
				{0xaa, 0x07}
			};

			close(c2p_pipe_fd[0]); // close c2p pipe read end (unused here)
			close(p2c_pipe_fd[1]); // close p2c pipe write end (unused here)

			for (int k = 0; k < 3; k++) {
				// allocate bufs on heap
				buf_redherring = (uint8_t*) malloc(CHUNK_LEN * sizeof(uint8_t));
				buf = (uint8_t*) malloc(CHUNK_LEN * sizeof(uint8_t));

				// recv f1[k] from parent
				if (read(p2c_pipe_fd[0], buf, CHUNK_LEN) != CHUNK_LEN) {
					exit(EXIT_FAILURE);
				}

				// red herring junk code (trollface)
				for (int i = CHUNK_LEN; i > 0; i -= 2) {
					buf_redherring[i] <<= 5 + (i % 3);
					buf_redherring[i - 1] = buf[i] ^ (keys[k][1] & 0x7F) + i;
					buf_redherring[i] >>= k;
					buf_redherring[i] = buf[i - 1] ^ keys[k][0];
					buf_redherring[i] <<= 3;
					buf_redherring[i - 1] &= (0x22 ^ i);
				}

				// decrypt f1[k] with keys[k]
				for (int i = 0; i < CHUNK_LEN - 1; i += 2) {
					buf[i] ^= keys[k][0];
					buf[i + 1] ^= keys[k][1];
				}

				// send decrypted f1[k] to parent
				if (write(c2p_pipe_fd[1], buf, CHUNK_LEN) != CHUNK_LEN) {
					exit(EXIT_FAILURE);
				}

				// clear & free bufs
				memset(buf, 0, CHUNK_LEN);
				memset(buf_redherring, 0, CHUNK_LEN);
				free(buf);
				free(buf_redherring);
			}

			close(c2p_pipe_fd[1]); // close c2p pipe write end (done using)
			fflush(stdout);
			exit(EXIT_SUCCESS);
		}
		default: {
			/* parent process */

			const uint8_t ko = 0x2c;
			uint8_t dump[CHUNK_LEN];
			uint8_t f1[3][CHUNK_LEN] = {
				{
					0xb4, 0xc8, 0xb5, 0xd8, 0xa5, 0xe6, 0x8f, 0xc2, 0x95, 0xe8, 
					0x96, 0xed, 0x89, 0xee, 0xd5, 0xc2, 0x9f, 0xf2, 0x93, 0xc2
				},
				{
					0xca, 0x90, 0x8e, 0x8f, 0x8f, 0x82, 0x9d, 0x89, 0xc9, 0x81, 
					0xa5, 0x88, 0x9f, 0xba, 0xb6, 0xae, 0xb4, 0xa2, 0xbc, 0xb0
				},
				{
					0xb5, 0x13, 0xbf, 0x73, 0xdf, 0x7d, 0xc1, 0x7f, 0xd5, 0x1c, 
					0xc9, 0x65, 0xca, 0x6e, 0xd3, 0x1f, 0xc2, 0x66, 0xcd, 0x56
				}
			};


			close(p2c_pipe_fd[0]); // close p2c pipe read end (unused here)
			close(c2p_pipe_fd[1]); // close c2p pipe write end (unused here)

			for (int k = 0; k < 3; k++) {
				// write f1[k] to child process
				if (write(p2c_pipe_fd[1], f1[k], CHUNK_LEN) != CHUNK_LEN) {
					exit(EXIT_FAILURE);
				}

				// recv f1[k] decrypted from child process
				if (read(c2p_pipe_fd[0], dump, CHUNK_LEN) != CHUNK_LEN) {
					exit(EXIT_FAILURE);
				}
			}

			printf(".,, ., ,, ,  ,.,, (0x%x) ,,.,   .,  ,. . .,,\n\n", ko);
			close(p2c_pipe_fd[1]);	// close p2c pipe write end (done using)
			exit(EXIT_SUCCESS);
		}
	}
}
