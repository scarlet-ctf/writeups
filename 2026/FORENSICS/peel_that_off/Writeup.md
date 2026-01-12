To do this challenge we need to understand what peeling is.

Peeling is a cryptocurrency money laundering technique that involves peeling off small amounts from a large sum of cryptocurrency to avoid raising red flags. For example, if an actor has 200 BTC they may want to spend 6 months to 1 year peeling off between 1-5 BTC and sending that amount to accounts they control at legitimate cryptocurrency services to not arouse suspicion with a big transaction.

Many examples of peeling show the perpetrator using the same amount for each peel, however this is not always a necessity, neither is it a necessity for the peeled off amount to be a perfectly round amount (i.e., 1.0 instead of 0.8211).

Our starting transaction `88617a44b501b2aa2ed1001a94fccbafb126578c5c2e696b20ae91dcc2a93e0a` indicates a co-spend of 17 different addresses from our scam cluster to two outputs, including one that has an even 140 BTC, $1.2 million USD at the time of the transaction.

If we follow that address, we see only two transactions: the receiving one and an outgoing one that sends off an even 5.0 BTC to one address and 134.9999 to another address, indicating the first peel. If we follow the peel a couple more times using this same technique, we start to see the peel amount change but still stay round and steadily peel off from the main amount.

**NOTE:** The transaction at `7c85009af98f60b3f3e109d915087a10d02ec78ef5ba90ff3490a3f27c829974` is not a round number but is still part of the peel chain due to it still following the pattern of peeling off from the main amount. Bad actors will try to obfuscate their peel by doing this.

Things get a little tricky when we see `3Nxqt1MLjvxd4GnZ9dXWzs85YSeFikJ5sb`. This address has two outgoing transactions, however only one of them is part of our chain. This one includes a much larger peel of 23 BTC from the original amount. The second transaction is not related to the original amount.

Following the 56.91807928 BTC amount as we have for all previous steps in the chain takes us to a transaction where the peel ends with a final 3.0 BTC being peeled off and the remaining 53.9180624 BTC going unspent.

This transaction hash is the first part of our flag and the 11/07/2021 timestamp is the second part. The exchange associated with the final transaction can be discerned with certain blockchain intelligence tools such as Arkham Intelligence and BreadCrumbs, which when entered in, label it as a Binance deposit address.

Combining all three to construct the flag gives us:

`RUSEC{87bb6410cf4d11b4220a0ff32e6d63fa95308898a8704cd9b48e5587b565f179:11/07/2021:binance}`

The possible pitfalls in this challenge could include following the peeled off amount rather than the larger amount and not being able to find a tool to identify the address in the last transaction.

<img width="750" height="435" alt="image" src="https://github.com/user-attachments/assets/c7dea04f-af59-44bd-8dea-de3b2ca7564f" />
