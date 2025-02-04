// @ts-types="./worldline.d.ts"
import loadWorldline, { type Pointer } from "./worldline.js";

export const worldline = await loadWorldline();

export const phraseSynthNew = worldline.cwrap("PhraseSynthNew", "number", []);
export const phraseSynthDelete = worldline.cwrap("PhraseSynthDelete", "void", [
  "number",
]);
export const phraseSynthAddRequest = worldline.cwrap(
  "PhraseSynthAddRequest",
  "void",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ],
);
export const phraseSynthSetCurves = worldline.cwrap(
  "PhraseSynthSetCurves",
  "void",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ],
);
export const phraseSynthSynth = worldline.cwrap("PhraseSynthSynth", "number", [
  "number",
  "number",
  "number",
]);

export const i32Size = 4;
export const floatSize = 4;
export const doubleSize = 8;
export const pointerSize = 4;

// deno-lint-ignore no-explicit-any
export const malloc = <T extends Pointer<any> | string>(
  size: number,
): Pointer<T> => {
  return worldline._malloc(size) as Pointer<T>;
};

// deno-lint-ignore no-explicit-any
export const free = (pointer: Pointer<any>) => {
  worldline._free(pointer);
};
