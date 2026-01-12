Reading the DOJ press release tells us that the transactions we are tracing involve an individual agreeing to pay a fake dark web hitman approximately **0.358 BTC** on **July 27, 2023**.

We can use any blockchain explorer or blockchain intelligence tool to follow the provided transaction: `427e04420fffc36e7548774d1220dad1d20c1c78dd71ad2e1e9fd1751917a035`

The hash presents three addresses: one input and two outputs.

**Input:** `bc1qryp4vf6jqree3n5c8a6lhw7gjv9sznsz0ndtus`

**Output 1:** `bc1qadgwek3qhng2jfc25epwuvg4cfsuq3dy4p8ccj`

**Output 2:** `bc1qt33f8ya0w4ges34f23a0xtkvflzutn0u2gy3gl`

Given Bitcoin's UTXO model (addresses will spend the entirety of their balance in a transaction), it is more than likely that one of the output addresses is a change address associated with the Bitcoin ATM and not the perpetrator. The address with the larger amount might at first look like it belongs to the perpetrator and not the ATM, given how similar it looks in total value to 0.358. However, the press release tells us the perpetrator used the ATM to convert cash into crypto on **three** separate occasions. This, alongside the fact that Output 1 has an amount that looks more similar to a human input, indicates that we need to follow Output 1 and leave Output 2 as just a change address associated with the ATM.

Following Output 1 as our perpetrator-attributed address takes us to a transaction where we see that same address co-spending three times:

**Inputs 1, 2, and 3:** `bc1qadgwek3qhng2jfc25epwuvg4cfsuq3dy4p8ccj`

**Output A:** `bc1q44mw0cffurnex8jxqvtvap3fwv3et0v9lxdc3t`

This transaction adds up to about 0.396 BTC and indicates the perpetrator consolidating funds, likely a feature from whatever wallet software she is using. This is not the transaction sent to the scammer. 

However, following Output A, we see the address make a payment of 0.358 BTC to a P2PKH address on July 27, 2023 — the exact amount and date as stated in the press release and the exact date.

The flag asks for the transaction hash which can be found on any blockchain explorer as `57ce32d129f4824aa8c7e71e56cf4908dcc32103f5fff3c3d6a08bd7bae78c48`

Please do not confuse the transaction hash with the addresses

