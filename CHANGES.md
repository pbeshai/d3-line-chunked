# Change Log

## 1.4.0

- Added in support for arbitrarily styling different chunks of the defined data. This can be done through the new `chunk()`, `chunkDefinitions`, and `chunkLineResolver()` properties. See the README for details and the demo for examples.


## 1.3.0

- Increased gap line default opacity from 0.2 to 0.35 to make it more visible for lower contrast screens (#9)
- Getter/setters now check for arguments.length before deciding to get or set (#10)
- Circles will not disappear and reappear if the X position is the same. (#12)
- Circle animation now handles transitions with delays (#13)
