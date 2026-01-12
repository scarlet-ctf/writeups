#!/bin/sh

echo -n "Enter URL of compiled exploit: "
read address

dir=$(mktemp -d)
curl -L --insecure --output ${dir}/exploit --max-filesize 3000000 "${address}"
if ! file ${dir}/exploit | grep -q "ELF"; then
	echo "File is not an ELF"
	rm -r ${dir}
	exit
fi
if [ $? -ne 0 ]; then
  echo "Failed to download"
  rm -r ${dir}
  exit
fi

echo "Access at /mnt/exploit"

qemu-system-x86_64 \
  -no-reboot \
  -cpu max \
  -net none \
  -serial mon:stdio \
  -display none \
  -monitor none \
  -vga none \
  -kernel bzImage \
  -initrd rootfs.cpio.gz \
  -append "panic=-1 console=ttyS0 kaslr" \
  -virtfs local,path="${dir}",mount_tag=shared,security_model=mapped-xattr

rm -r ${dir}
