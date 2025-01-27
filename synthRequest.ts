import { Pointer } from "./worldline.d.ts";
import * as core from "./core.ts";

const ceil = <T extends number>(a: T, b: number): T => {
  return (Math.ceil(a / b) * b) as T;
};

export interface SynthRequest {
  // i32
  sampleFs: number;
  // i32, double*
  samples: number[];
  // i32, char*
  frq: Uint8Array | null;
  // i32
  tone: number;
  // double
  conVel: number;
  // double
  offset: number;
  // double
  requiredLength: number;
  // double
  consonant: number;
  // double
  cutOff: number;
  // double
  volume: number;
  // double
  modulation: number;
  // double
  tempo: number;
  // i32, i32*
  pitchBend: number[] | null;

  // i32
  flagG: number;
  // i32
  flagO: number;
  // i32
  flagP: number;
  // i32
  flagMt: number;
  // i32
  flagMb: number;
  // i32
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
  for (const [size, value] of [
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
  ]) {
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
