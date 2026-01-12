# Mel Studios
Github:
* https://github.com/AmeliaYeah

**IMPORTANT:** Requires specific domain `http://melstudios.ctf.rusec.club` (this will be the webserver shown and where it's deployed to)

Difficulties:
* L0: OSINT (easy)
* L1: REV (medium)
* L2: WEB (medium)
* L3: CRYPTO (medium)
* L4: BINEX (hard)

**REQUIRES DEPLOYABLE CONTENT**

Participant files:
* L4:
	* `rootfs.cpio.gz` **MAKE SURE THE ACTUAL FLAG ISNT IN IT!**
	* `bzImage`
	* `run.sh`
	* `kernel_config`

Flags:
* L0: `RUSEC{d0wnlo4d_y0ur_fr33_c0py_t0day!}`
* L1: `RUSEC{sp4cetime_flagt1me_w3lcome_t0_th3_g4me_th1s_1s_0nly_th3_b3g1nn1ng_fr1end}`
* L2: `RUSEC{w0w_1m_sur3_y0u_obt4ined_th1s_sc0re_l3gally_and_l3git}`
* L3: `RUSEC{trust_me_br0_im_t0tally_admin_y0ur_s3cret_is_s4fe_with_m3}`
* L4: `RUSEC{k3rnel_p4nic_n0t_sp4cetiming}`
 	* Ensure the `example1` binary has md5sum `47ba5306d9599836f30338550e0babd3`
 		* the binary itself is critical to be preserved, as compilation might change stack offsets, addresses, etc
	* Ensure `anticheat.ko` has md5sum `933ae4f5df970582ccd8b10cd2acbb04`

## Descriptions
### Level 0
Haii!! I need your help! \>\_\>

There's this microcelebrity girlypop game developer called [Amels](https://amels.itch.io/) I'm really fond of. I've been following her work **EXTENSIVELY!** on her social media!! (Call me a big fan)

(She hates alot of common social medias like Instagram, Twitter, etc., so it was really hard to find it \>\_\<)

However, there's this new game that I really, **REALLY** want to play!! I've heard, from what she's been saying, that it's called `SpaceTime`, but I can't seem to find it anywhere! I'm not that much of an OSINT GOD like u seem to be, could u maybe help me figure it out? :c

Can you find the listing of the game and gain access to it? Pweeese!! I neeed to play it :\(

### Level 1
WAOW!! Looks like we finally found itz!!!1 :D

Are you able to take a look at it??? Maybe there's some super secret secrets in plain sight we could get our hands on hehe >:3

### Level 2
OMG!!! This is big!!! I don't know how u are so smart at dis...

Can u dig even deeper? I'm sure something in dat server has some vulnerability...

She mentioned something about a graph that looked like a V?

### Level 3
A wittle birdy once told meh that Amels was really *really* scared about something regarding authentication :O

She responded saying that there's a critical flaw in authentication that *could* be VERYY bad!!! It was something about the vulnerabilites of "CBC-MAC" and how she wanted to try "another mode"? Something with "feedback" in the name. I'm not a hacker 🤓 emoji like u so I have no clue what that means, but figured it might be important...

I also saw on stream that she was playing with an account called `amels_gamedev_12` with some 2 numbers after it that I forgor :c

Can u maybe exploit this >:3

(Maybe u can get into her accoujnt!!)

### Level 4
This is supes big!!

Turns out this silly little game dev is becoming a **KERNEL** dev?? People have been saying some crazy things!! Apparentyl she's making her own kernel level anticheat?? And it's WIP???

You need to get to the bottom of this. I managed to sneak out some files (hehe phishing ^-^ phishy). Can you see if it's vulnerable? She's running it on her home network, so maybe if we can PWN HER SYSTEM we can leak all her SUPER SECRET VIDEO GAMES!!1! (i'll be RICHHHHH)

Tank u!!! You're the best!!! :D

(This level is unrelated to previous levels and doesn't require any of the knowledge given by them)

### Level 5
So, apparently there was something up with the emulator...? :0

Turns out, she fixed it. Something with an escape character. Whatever, she fixed it now.

(Use the same files as `Melstudios Level4`)