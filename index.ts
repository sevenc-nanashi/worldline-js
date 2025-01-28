import * as core from "./core.ts";
import {
  deleteSynthRequest,
  type SynthRequest,
  synthRequestToPointer,
} from "./synthRequest.ts";
// @ts-types="./worldline.d.ts"
import type { Pointer } from "./build/worldline.js";

let logCallback: (msg: string) => void = console.log;
const logCallbackPointer = core.worldline.addFunction(
  (msg: Pointer<"char">) => {
    logCallback(core.worldline.UTF8ToString(msg));
  },
  "vi",
);

/** Sets the callback function for log messages. The default is `console.log`. */
export function setLogCallback(callback: (msg: string) => void) {
  logCallback = callback;
}

const registry = new FinalizationRegistry((synth: Pointer<"PhraseSynth">) => {
  core.phraseSynthDelete(synth);
});

/** PhraseSynth of Worldline. */
export class PhraseSynth {
  #pointer: Pointer<"PhraseSynth">;

  /** Creates a new PhraseSynth. */
  constructor() {
    this.#pointer = core.phraseSynthNew();
    registry.register(this, this.#pointer, this);
  }

  /** Adds a request to the PhraseSynth. */
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

    deleteSynthRequest(synthRequestPointer);
  }

  /** Sets the curves for the PhraseSynth. */
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
    core.worldline.HEAPF64.set(f0, f0Pointer / core.doubleSize);

    const genderPointer = core.malloc<"number">(
      gender.length * core.doubleSize,
    );
    core.worldline.HEAPF64.set(gender, genderPointer / core.doubleSize);

    const tensionPointer = core.malloc<"number">(
      tension.length * core.doubleSize,
    );
    core.worldline.HEAPF64.set(tension, tensionPointer / core.doubleSize);

    const breathinessPointer = core.malloc<"number">(
      breathiness.length * core.doubleSize,
    );
    core.worldline.HEAPF64.set(
      breathiness,
      breathinessPointer / core.doubleSize,
    );

    const voicingPointer = core.malloc<"number">(
      voicing.length * core.doubleSize,
    );
    core.worldline.HEAPF64.set(voicing, voicingPointer / core.doubleSize);

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

  /** Synthesizes the PhraseSynth and returns the result. */
  public synth(): Float32Array {
    const yPointer = core.worldline._malloc(core.pointerSize) as Pointer<
      Pointer<"number">
    >;
    const size = core.phraseSynthSynth(
      this.#pointer,
      yPointer,
      logCallbackPointer,
    );
    const yPointerValue = core.worldline.HEAP32[
      yPointer / core.pointerSize
    ] as Pointer<"number">;
    const y = core.worldline.HEAPF32.slice(
      yPointerValue / core.floatSize,
      yPointerValue / core.floatSize + size,
    );

    core.free(yPointerValue);
    core.free(yPointer);
    return y;
  }

  /** Deletes the PhraseSynth. */
  delete() {
    core.phraseSynthDelete(this.#pointer);
    registry.unregister(this);
  }

  /**
   * Deletes the PhraseSynth (alias of `delete`).
   *
   * This method is useful when you are using the [`using` statement](https://github.com/tc39/proposal-explicit-resource-management).
   */
  [Symbol.dispose]() {
    this.delete();
  }
}

export type { SynthRequest } from "./synthRequest.ts";
