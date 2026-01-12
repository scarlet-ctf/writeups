# Peel that off! by Agent Bobr
Github: put_your_github_url_here_if_you_want
Difficulty: medium

Participant files:
* N/A

Hints:
* Maybe I should ask my buddies in the AML and financial crimes unit what peeling is...

Flag: `RUSEC{87bb6410cf4d11b4220a0ff32e6d63fa95308898a8704cd9b48e5587b565f179:11/07/2021:binance}`

## Description

We just identified a scam cluster cashing out! Looks like the cluster is peeling off funds starting from this transaction:

`88617a44b501b2aa2ed1001a94fccbafb126578c5c2e696b20ae91dcc2a93e0a`

Can you trace through the transactions and find the end of the peel chain? Upload the transaction with the last traceable transaction in the peel chain that we can attribute as the actor from our scam cluster! These types of peels can take a while and we want to know what service was used. We believe one of the receiving addresses will be a deposit address controlled by a cryptocurrency exchange, so upload the date of the transaction in the format MM/DD/YYYY as well as the name of the exchange that is associated with one or more of the receiving addresses in the final transaction on the peel chain.

FLAG FORMAT: `RUSEC{hash:date:exchange}`

For example, if you think the transaction hash is `49100341fe8d99bd1ed7cec22edf0ec63d6920a01627e34249b2dfb3c464bca0`, the date is January 2nd, 2026, and one of the receiving parties is a deposit address belonging to https://www.kraken.com/, upload it in the format:

`RUSEC{49100341fe8d99bd1ed7cec22edf0ec63d6920a01627e34249b2dfb3c464bca0:01/02/2026:kraken}`
