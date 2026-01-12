#!/bin/sh
set -e

# this will fail i deleted the linux repo bc of the insane storage space lmao
# kmodule is built trust
# echo "Compiling.."
# cd kmodule
# make all
# cd ..
# mv kmodule/anticheat.ko rootfs

if [ "$1" = "PROD" ]; then
	cp flag.txt rootfs
	echo "PRODUCTION MODE (real flag)"
else
	echo -n 'RUSEC{testing}' > rootfs/flag.txt
fi

# compile example userland files
# remove kmodule files (not to be compiled in userland)
# important to make compiling binaries optional (ghidra static analysis required on example1)
if [ "$1" = "COMPILE_BINS" ]; then
	echo "Compiling binaries.."
	for i in `ls rootfs/home/amels/*.c`; do
		echo gcc ${i} -no-pie -o "rootfs/home/amels/$(basename ${i} ".c")"
	done
fi

# move kmodule src to the home directory so players can see it
mkdir -p rootfs/home/amels/kmodule
for i in `ls kmodule/*.c && ls kmodule/*.h`; do
	cp ${i} rootfs/home/amels/kmodule
done

cd rootfs
find . | cpio -ov --format=newc 2>/dev/null | gzip > ../rootfs.cpio.gz
cd ..

# Linux version 6.16.0
