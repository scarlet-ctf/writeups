obj-m := amels_anticheat.o
amels_anticheat-m := anticheat.o anticheat_ops.o utils.o probes.o

KDIR := linux
PWD := $(shell pwd)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules
	mv amels_anticheat.ko anticheat.ko

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean