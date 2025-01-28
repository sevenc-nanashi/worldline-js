import "@types/emscripten";

type Brand<K, T> = K & { __brand: T };

// deno-lint-ignore no-explicit-any
export type Pointer<T extends Pointer<any> | string> = number & {
  __brand: `Pointer<${T extends Pointer<never> ? T["__type"] : T}>`;
  __type: T;
};

// deno-lint-ignore no-explicit-any
export type Callback<F extends (...args: any[]) => any> = number & {
  __brand: "Callback";
  __callback: F;
};

type Functions = {
  PhraseSynthNew: () => Pointer<"PhraseSynth">;
  PhraseSynthDelete: (phraseSynth: Pointer<"PhraseSynth">) => void;
  PhraseSynthAddRequest: (
    phraseSynth: Pointer<"PhraseSynth">,
    request: Pointer<"SynthRequest">,
    posMs: number,
    skipMs: number,
    lengthMs: number,
    fadeInMs: number,
    fadeOutMs: number,
    logCallback: Callback<(msg: Pointer<"char">) => void>,
  ) => void;
  PhraseSynthSetCurves: (
    phraseSynth: Pointer<"PhraseSynth">,
    f0: Pointer<"number">,
    gender: Pointer<"number">,
    tension: Pointer<"number">,
    breathiness: Pointer<"number">,
    voicing: Pointer<"number">,
    length: number,
    logCallback: Callback<(msg: Pointer<"char">) => void>,
  ) => void;
  PhraseSynthSynth: (
    phraseSynth: Pointer<"PhraseSynth">,
    y: Pointer<Pointer<"number">>,
    logCallback: Callback<(msg: Pointer<"char">) => void>,
  ) => number;

  main: (argc: number, argv: Pointer<Pointer<"char">>) => number;
};

type ToWasmType<T> = T extends number
  ? "number"
  : T extends string
    ? "string"
    : T extends boolean
      ? "boolean"
      : // deno-lint-ignore no-explicit-any
        T extends Pointer<any>
        ? "number"
        : T extends void
          ? "void"
          : never;
type Ccall = <T extends keyof Functions>(
  name: T,
  returnType: ReturnType<Functions[T]> extends Promise<infer U>
    ? ToWasmType<U>
    : ToWasmType<ReturnType<Functions[T]>>,
  argTypes: ("number" | "string" | "boolean" | "void")[],
  args: Parameters<Functions[T]>,
) => ReturnType<Functions[T]>;
type Cwrap = <T extends keyof Functions>(
  name: T,
  returnType: ReturnType<Functions[T]> extends Promise<infer U>
    ? ToWasmType<U>
    : ToWasmType<ReturnType<Functions[T]>>,
  argTypes: ("number" | "string" | "boolean" | "void")[],
) => Functions[T];
type Worldline = EmscriptenModule & {
  ccall: Ccall;
  cwrap: Cwrap;
  ready: Promise<Worldline>;
  getValue: typeof getValue;
  stackSave: typeof stackSave;
  stackRestore: typeof stackRestore;
  stackAlloc: typeof stackAlloc;
  UTF8ToString: typeof UTF8ToString;
  // deno-lint-ignore no-explicit-any
  addFunction: <T extends (...args: any[]) => any>(
    func: T,
    signature: string,
  ) => Callback<T>;
  FS: typeof FS;
};
export default function (): Promise<
  Worldline & {
    ready: Promise<Worldline>;
  }
>;
