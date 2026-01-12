#/usr/bin/python3
import readline

print("Hello, world!")
print("Welcome to the official Scarlet CTF Rules Trivia!")
print("The game is simple, read the rules, and answer correctly.")
print("Each question is TRUE or FALSE! (I.E: the statement is either correct, or not)")
print("Put your answer either as:")
print("\tT (for true)")
print("\tF (for false)")
print()
print("Don't attack this application, that's not the goal of this challenge.")
print("You'll get the flag when you answer all questions correctly.")
print()

questions = [
	("You are NOT allowed to compromise/pentest our CTF platform (rCTF, scoreboard, etc.)", "T"),
	("Flag sharing (sharing flags to someone not on your team) is NOT allowed", "T"),
	("If you have a question regarding the CTF, you ping the admins or DM them", "F", "You make a ticket"),
	("Asking for help from other people (not on your team) for challenges is allowed if you're stuck", "F", "You are not allowed to ask external people for help on challenges"),
	("You are allowed to use automated scanners/fuzzing/bruteforcing whenever you wish with NO restrictions", "F", "You are only allowed to do so when a challenge specifically requires it"),
	("Your teams can be of unlimited size", "T"),
    ("You are allowed to do ACTIVE attacking during OSINT (i.e: contacting potential targets), not just passive, when you feel it is necessary", "F", "OSINT is strictly passive"),
	("PASSIVE OSINT techniques are allowed on general RUSEC infrastructure only when EXPLICITLY given specific permission to by a challenge", "T"),
    ("ACTIVE techniques (i.e: pentesting) are allowed on general RUSEC infrastructure at any time", "F", "Active pentesting is NEVER ever allowed on RUSEC infrastructure"),
	("Official writeups will be posted at the end of the competition", "T")
]

try:
	wrong = 0
	for i,q in enumerate(questions):
		print(f"== ({i+1}/{len(questions)}) {q[0]} ==")
		res = input("T for TRUE, F for FALSE> ").strip().upper()
		if res != q[1]:
			wrong += 1

	print()
	if wrong == 0:
		print("Congratulations!")
		for q in questions:
			print(f"* {q[0]}: {q[1]}")
			if q[1] == "F":
				print(f"\tReason: {q[2]}")
		print()
		print("RUSEC{you_read_the_rules}")
	else:
		print(f"You got {wrong} questions wrong; no flag so far")
except:
	print("Exiting...")
