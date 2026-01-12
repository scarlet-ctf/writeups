# Stuck In The Middle With You by DF
Github: put_your_github_url_here_if_you_want
Difficulty: easy

Participant files:
* N/A

Hints:
* Chopping onions really makes me cry

Flag: `RUSEC{212.47.233.86:51.15.40.38:151.115.73}`

## Description

We're trying to figure out how to track this Tor traffic but all we've got is this string, `A68097FE97D3065B1A6F4CE7187D753F8B8513F5`! We don't know what to do with it. We're looking for someone responsible for hosting multiple nodes. Can you find the IPv4 addresses this node and any of its effective family members?

FLAG FORMAT: `RUSEC{family_ip1:family_ip2:...:family_ipX}` for X family members

The flag will be the IPs of the node and all the associated family members **in order of oldest node to youngest**, based on when they were first seen, separated by colons.

For example, if you find five family members your flag might look something like: `RUSEC{8.8.8.8:1.1.1.1:127.0.0.1:192.168.1.1:4.2.2.2}`

`8.8.8.8` is the oldest node, then the nodes progressively get younger until we reach the youngest, `2.2.2.2`
