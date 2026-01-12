When looking at the `/docs` endpoint of the server, there is a listing for obtaining the "Level 2 Flag". It requires us to, after some investigative work, have a score of atleast `1337133713371337`.

We can arbitrarily set out stats (score being the main useful thing) by simply sending it to the `/update` endpoint. However, the score is capped at a maximum of `10000000`. Anything else will error out to us.

The vulnerability however is that, after some more digging, we are able to send in a negative score that gets interpreted as a positive (via the `abs()` function), but only gets turned to a positive **after the check above is complete**.

So, basically:
1. Send in a number, let's say, `-(10000000+1)`
1. Is `-(10000000+1) > 10000000`? No, it isn't. Continue.
1. `abs(-(10000000+1))` becomes `10000000+1`.
1. Our score gets set to that number, very clearly bigger than the maximum being checked against.

(Of course, there's another thing that clamps our score even after `abs()` so as not to be bigger than the admin's score, but that doesn't matter here.)

So, after sending in `-1337133713371337` as a score, we can then query the "Level 2 Flag" endpoint, and our score will be adequate enough for it to return the flag to us.