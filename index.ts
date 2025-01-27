import * as core from "./core.ts";
import { SynthRequest, synthRequestToPointer } from "./synthRequest.ts";
// @ts-types="./worldline.d.ts"
import { Pointer } from "./build/worldline.js";

let logCallback: (msg: string) => void = console.log;
const logCallbackPointer = core.worldline.addFunction(
  (msg: Pointer<"char">) => {
    logCallback(core.worldline.UTF8ToString(msg));
  },
  "vi",
);
export function setLogCallback(callback: (msg: string) => void) {
  logCallback = callback;
}

const registry = new FinalizationRegistry((synth: Pointer<"PhraseSynth">) => {
  core.phraseSynthDelete(synth);
});
export class PhraseSynth {
  #pointer: Pointer<"PhraseSynth">;

  constructor() {
    this.#pointer = core.phraseSynthNew();
    registry.register(this, this.#pointer, this);
  }

  public addRequest(
    request: SynthRequest,
    posMs: number,
    skipMs: number,
    lengthMs: number,
    fadeInsMs: number,
    fadeOutMs: number,
  ) {
    const synthRequestPointer = synthRequestToPointer(request);
    core.phraseSynthAddRequest(
      this.#pointer,
      synthRequestPointer,
      posMs,
      skipMs,
      lengthMs,
      fadeInsMs,
      fadeOutMs,
      logCallbackPointer,
    );
  }

  public setCurves(
    f0: number[],
    gender: number[],
    tension: number[],
    breathiness: number[],
    voicing: number[],
  ) {
    if (
      f0.length !== gender.length ||
      f0.length !== tension.length ||
      f0.length !== breathiness.length ||
      f0.length !== voicing.length
    ) {
      throw new Error(
        `Array lengths must be equal: f0=${f0.length}, ` +
          `gender=${gender.length}, tension=${tension.length}, ` +
          `breathiness=${breathiness.length}, voicing=${voicing.length}`,
      );
    }

    const f0Pointer = core.malloc<"number">(f0.length * core.doubleSize);
    core.worldline.HEAPF32.set(f0, f0Pointer / core.doubleSize);
    const genderPointer = core.malloc<"number">(
      gender.length * core.doubleSize,
    );
    core.worldline.HEAPF32.set(f0, genderPointer / core.doubleSize);
    const tensionPointer = core.malloc<"number">(
      tension.length * core.doubleSize,
    );
    core.worldline.HEAPF32.set(f0, tensionPointer / core.doubleSize);
    const breathinessPointer = core.malloc<"number">(
      breathiness.length * core.doubleSize,
    );
    core.worldline.HEAPF32.set(f0, breathinessPointer / core.doubleSize);
    const voicingPointer = core.malloc<"number">(
      voicing.length * core.doubleSize,
    );
    core.worldline.HEAPF32.set(f0, voicingPointer / core.doubleSize);
    core.phraseSynthSetCurves(
      this.#pointer,
      f0Pointer,
      genderPointer,
      tensionPointer,
      breathinessPointer,
      voicingPointer,
      f0.length,
      logCallbackPointer,
    );

    core.free(f0Pointer);
    core.free(genderPointer);
    core.free(tensionPointer);
    core.free(breathinessPointer);
    core.free(voicingPointer);
  }

  public synth() {
    const yPointer = core.worldline._malloc(core.pointerSize) as Pointer<
      Pointer<"number">
    >;
    const size = core.phraseSynthSynth(
      this.#pointer,
      yPointer,
      logCallbackPointer,
    );
    const yPointerValue = core.worldline.HEAP32[yPointer / core.pointerSize] as Pointer<"number">;
    const y = core.worldline.HEAPF32.slice(
      yPointerValue / core.doubleSize,
      yPointerValue / core.doubleSize + size,
    );

    core.free(yPointerValue);
    core.free(yPointer);
    return y;
  }

  delete() {
    core.phraseSynthDelete(this.#pointer);
    registry.unregister(this);
  }
}

export const parseOtoIniLine = (line: string) => {
  const match = line.match(
    /(?<name>.+)=(?<alias>.+),(?<offset>.+),(?<consonant>.+),(?<cut_off>.+),(?<preutter>.+),(?<overlap>.+)/,
  );
  const groups = match?.groups;
  if (!groups) {
    throw new Error(`Invalid oto.ini line: ${line}`);
  }
  return {
    fileName: groups.name,
    alias: groups.alias,
    offset: parseFloat(groups.offset),
    consonant: parseFloat(groups.consonant),
    cutOff: parseFloat(groups.cut_off),
    preutter: parseFloat(groups.preutter),
    overlap: parseFloat(groups.overlap),
  };
};

export type { SynthRequest } from "./synthRequest.ts";
