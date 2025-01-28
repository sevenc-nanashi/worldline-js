# worldline-js

[![JSR](https://jsr.io/badges/@sevenc-nanashi/worldline-js)](https://jsr.io/@sevenc-nanashi/worldline-js)

worldline-js is wrapper of
[worldline](https://github.com/stakira/OpenUtau/tree/master/cpp), compiled to
WebAssembly with Emscripten.

## Installation

Please follow [jsr documentation](https://jsr.io/docs/using-packages) for
installation instructions.

```bash
# Deno
deno add @sevenc-nanashi/worldline-js

# Node.js (one of the below, depending on your package manager)
npx jsr add @sevenc-nanashi/worldline-js
yarn dlx jsr add @sevenc-nanashi/worldline-js
pnpm dlx jsr add @sevenc-nanashi/worldline-js

# Bun
bunx jsr add @sevenc-nanashi/worldline-js
```

## Usage

Please check jsr docs for more information.

```ts
const request: SynthRequest = {
  sampleFs: 44100,
  samples: data,
  frq,
  tone: 40,
  conVel: 100,
  offset: 149.905,
  requiredLength: 1000.0,
  consonant: 171.608,
  cutOff: -866.658,
  volume: 100.0,
  modulation: 0.0,
  tempo: 0.0,
  pitchBend: null,
  flagG: 0,
  flagO: 0,
  flagP: 86,
  flagMt: 0,
  flagMb: 0,
  flagMv: 100,
};

phraseSynth.addRequest(request, 0.0, 0.0, 900.0, 5.0, 35.0);
phraseSynth.setCurves(
  new Array(100).fill(261.0),
  new Array(100).fill(0.5),
  new Array(100).fill(0.5),
  new Array(100).fill(0.5),
  new Array(100).fill(0.5),
);

const y = phraseSynth.synth();
```

## Building

You need [Rake](https://ruby.github.io/rake/) and
[Emscripten](https://emscripten.org/) to build this project.

```bash
rake build                  # Build the project
rake build:cmake[debug]     # Build with CMake
rake build:copy             # Copy files
rake build:patch_artifact   # Patch artifact
rake build:patch_worldline  # Patch Worldline
rake clean                  # Clean the project
rake notice                 # Generate NOTICE.md
rake test:download          # Download Lunamira's UTAU voicebank
```

## License

This library is licensed under the MIT license. This also includes the worldline
library, which is licensed under the MIT license.
