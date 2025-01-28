import type { Pointer } from "./worldline.d.ts";
import * as core from "./core.ts";

const ceil = <T extends number>(a: T, b: number): T => {
  return (Math.ceil(a / b) * b) as T;
};

/** Represents a request to synthesize a phrase. */
export interface SynthRequest {
  /** The sample rate of the audio. */
  sampleFs: number;
  /** The audio samples. Will be converted to f64[] in the WASM. */
  samples: number[];
  /** The frq file. */
  frq: Uint8Array | null;
  /** The MIDI tone. */
  tone: number;
  /** The consonant velocity. 100 is normal. */
  conVel: number;
  /** The offset. 1st element of the frq file. */
  offset: number;
  /** The required length. */
  requiredLength: number;
  /** The consonant length. 2nd element of the frq file. */
  consonant: number;
  /** The cutoff. 3rd element of the frq file. */
  cutOff: number;
  /** The volume. 100 is normal. */
  volume: number;
  /** The modulation. */
  modulation: number;
  /** The tempo. */
  tempo: number;
  /** Pitch bend. */
  pitchBend: number[] | null;

  /** The G flag. 0 is normal. */
  flagG: number;
  /** The O flag. 0 is normal. */
  flagO: number;
  /** The P flag. 86 is normal. */
  flagP: number;
  /** The Mt flag. 0 is normal. */
  flagMt: number;
  /** The Mb flag. 0 is normal. */
  flagMb: number;
  /** The Mv flag. 100 is normal. */
  flagMv: number;
}
export const synthRequestToPointer = (
  request: SynthRequest,
): Pointer<"SynthRequest"> => {
  const pointer = core.malloc<"SynthRequest">(
    core.i32Size * 6 + core.doubleSize * 7 + core.i32Size * 8,
  );

  const samplesPointer = core.malloc<"number">(
    core.doubleSize * request.samples.length,
  );
  for (let i = 0; i < request.samples.length; i++) {
    core.worldline.HEAPF64[samplesPointer / core.doubleSize + i] =
      request.samples[i];
  }

  let frqSize = 0;
  let frqPointer = 0;
  if (request.frq != null) {
    frqSize = request.frq.length;
    frqPointer = core.malloc<"char">(request.frq.length);
    core.worldline.HEAPU8.set(request.frq, frqPointer);
  }

  let pitchBendSize = 0;
  let pitchBendPointer = 0;
  if (request.pitchBend) {
    pitchBendSize = request.pitchBend.length;
    pitchBendPointer = core.malloc<"number">(
      core.i32Size * request.pitchBend.length,
    );
    for (let i = 0; i < request.pitchBend.length; i++) {
      core.worldline.HEAP32[pitchBendPointer / core.i32Size + i] =
        request.pitchBend[i];
    }
  }

  let currentPointer = pointer;
  for (
    const [size, value] of [
      [core.i32Size, request.sampleFs],
      [core.i32Size, request.samples.length],
      [core.pointerSize, samplesPointer],
      [core.i32Size, frqSize],
      [core.pointerSize, frqPointer],
      [core.i32Size, request.tone],
      [core.doubleSize, request.conVel],
      [core.doubleSize, request.offset],
      [core.doubleSize, request.requiredLength],
      [core.doubleSize, request.consonant],
      [core.doubleSize, request.cutOff],
      [core.doubleSize, request.volume],
      [core.doubleSize, request.modulation],
      [core.doubleSize, request.tempo],
      [core.i32Size, pitchBendSize],
      [core.pointerSize, pitchBendPointer],
      [core.i32Size, request.flagG],
      [core.i32Size, request.flagO],
      [core.i32Size, request.flagP],
      [core.i32Size, request.flagMt],
      [core.i32Size, request.flagMb],
      [core.i32Size, request.flagMv],
    ]
  ) {
    if (size === core.i32Size) {
      core.worldline.HEAP32[currentPointer / core.i32Size] = value;
    } else {
      core.worldline.HEAPF64[currentPointer / core.doubleSize] = value;
    }
    currentPointer = ceil(
      (currentPointer + size) as Pointer<"SynthRequest">,
      size,
    );
  }

  return pointer as Pointer<"SynthRequest">;
};

export const deleteSynthRequest = (pointer: Pointer<"SynthRequest">) => {
  const samplesPointer = core.worldline.HEAP32[
    pointer / core.pointerSize + 2
  ] as Pointer<"number">;
  core.free(samplesPointer);

  const frqPointer = core.worldline.HEAP32[
    pointer / core.pointerSize + 4
  ] as Pointer<"char">;
  if (frqPointer) {
    core.free(frqPointer);
  }

  const pitchBendPointer = core.worldline.HEAP32[
    pointer / core.pointerSize + 16
  ] as Pointer<"number">;
  if (pitchBendPointer) {
    core.free(pitchBendPointer);
  }

  // TODO: it SRGVs
  // core.free(pointer);
};
