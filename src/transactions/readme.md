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

legacy txs

- MTU 1280 bytes (same as IPv6 packet size)
- 1232 bytes left for packet data
- 2 components
  - array of sigs. each sig is 64 byte ed25519
  - message
    1. header
       - contains 3 u8 ints. 3 bytes
       1. num of required sigs. sol runtime verifies this num with length of array of sigs
       2. num of read only account addresses that require sigs
       3. num of read only account addresses that do not require sigs
    2. array of account addresses. each address takes 32 bytes
       1. compact u16 encoding of num of account addresses
       2. account addresses that require sigs (read & write access)
       3. account addresses that do not require sigs (read only access)
    3. recent blockhash. 32 byte sha256 hash
    4. array of instructions
       1. compact u16 encoding of num of ixs
       2. array of instructions
          1. program id
          2. array of account address indexes. u8 indexes to account addresses in 2
          3. array of u8 data. general purpose data array

address lookup tables (LUT)

- store account addresss in array on-chain
- address of table can then be referenced in tx message
- can point to account on table with u8 index
- addresses don't need to be stored inside tx message anymore

LUT structure

- metadata
- size
- array of addresses (max 256)

versioned txs

- first bit set in a tx with version
- LUTs at Version 0
- if no first bit set, tx is Legacy

- components
  - messagev0
    1. header. unchanged
    2. array of account addresses. unchanged
    3. recent blockhash. unchanged.
    4. array of ixs. changed
       - ix structure is same
       - ix array of account indexes now uses 2, and 5.2, 5.3. (legacy was just 2)
    5. array of address table lookups. new
       1. compact u16 encoding of number of address table lookups
       2. array of address table lookups
          1. account key. u8
          2. writable indexes
          3. read only indexes

rpc changes

- clients need to indicate maxSupportedTransactionVersion for getTransaction and getBlock
- maxSupportedTransactionVersion: 0, to include new txs
