serialization in a programs lifecycle:

- 1.  serialize ix data on client
- 2.  deserialize ix data on program
- 3.  serialize account data on program
- 4.  deserialize account data on client

example program
https://github.com/hashblock/solana-cli-program-template

1. serialize ix data on client

- see serialize-ix.ts

2. deserialize ix data on program

- Pack trait
- fn for unpack(), calls Pack implementation of unpack_from_slice
- based on the ix enum
- you implement Pack for your custom program

3. serialize account data on program

- Pack trait
- fn for pack(), calls Pack implementation of pack_into_slice
- you implement Pack for your custom program

4. deserialize account data on client

- see deserialize-account.ts

##### generalized program flow
entry_point.rs, process_instruction() -> 
processor.rs, process() -> 
    here ix data is deserialized on program with unpack()
    match the ix enum and call it's corresponding process fn
processor.rs, specific_fn() ->
    does some function x
finished
