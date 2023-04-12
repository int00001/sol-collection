two main ways to send txs to leaders

- by proxy via sending to an RPC server and the sendTransaction RPC method
- directly to leaders via TPU client

rpc

- rpc receives a transaction via sendTransaction
- converts it to a UDP packet
- broadcasts it current and next leaders
- default: rpc nodes will foward txs to leaders every 2 seconds
- until tx is finalized or the blockhash is expired (150 blocks passed)
- if outstanding rebroadcast queue size is >10K txs, newly submitted txs are dropped
- when broadcasting RPC forwards to leader's TPU

tpu

- processes txs in 5 phases
- fetch stage
- sigverify stage
- banking stage
- proof of history stage
- broadcast stage

more info on this: https://jito-labs.medium.com/solana-validator-101-transaction-processing-90bcdc271143

dropped txs

- can drop due to UDP packet loss, during intense network load routers simply drop packets
- rpcs limit amount of txs that can be forwarded based on current queue (default 10K)
- each tx forward is only fowarded to the next validator, single hop
- can drop to inconsistencies in an rpc pool. querying recentBlockhash from the
  advanced part, and submitted the tx to the lagging part.
  lagging rpc nodes will not recognize advanced blockhash and will drop tx
- can drop due to temporary network forks.
  validator creates minority fork, tx references recentBlockhash in that minority fork.
  cluster then switches away from minority fork and tx is dropped

sendTransaction

- only relays tx from client to RPC node
- maxRetries overrides RPC node's default retry logic for a tx
- not the fastest way to send tx
