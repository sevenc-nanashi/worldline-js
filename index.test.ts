import * as fs from "@cross/fs";
import { CurrentRuntime } from "@cross/runtime";
import { BinaryWriter } from "@sevenc-nanashi/binaryseeker";
import { createCrossTest } from "@sevenc-nanashi/cross-test";
import { PhraseSynth, SynthRequest } from "./index.ts";

const crossTest = await createCrossTest(import.meta.url, {
  runtimes: ["node", "deno", "bun"],
});

// https://github.com/sevenc-nanashi/Cantari/blob/main/crates/worldline/tests/main_test.rs
crossTest("Hello World", async () => {
  const phraseSynth = new PhraseSynth();
  const cvcRoot =
    "./deps/tyc-utau/つくよみちゃんUTAU音源/多音階01：_B3（連続音）";
  const testAudio = `${cvcRoot}/_ああR.wav`;
  const content = await fs.readFile(testAudio).then((x) => new Uint8Array(x));
  const data = Array.from(new Int16Array(content.slice(44).buffer)).map(
    (x) => x / 32768.0,
  );

  const frq = await fs
    .readFile(`${cvcRoot}/_ああR_wav.frq`)
    .then((x) => new Uint8Array(x));
  // 149.905,171.608,-866.658,46.608,0.0
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

  const buffer = new BinaryWriter();
  buffer.writeChars("RIFF");
  buffer.writeUInt32LE(y.length * 4 + 36);
  buffer.writeChars("WAVE");
  buffer.writeChars("fmt ");
  buffer.writeUInt32LE(16);
  buffer.writeUInt16LE(3); // IEEE Float
  buffer.writeUInt16LE(1); // Mono
  buffer.writeUInt32LE(44100); // Sample Rate
  buffer.writeUInt32LE(44100 * 4); // Byte Rate
  buffer.writeUInt16LE(4); // Block Align
  buffer.writeUInt16LE(32); // Bits Per Sample
  buffer.writeChars("data");
  buffer.writeUInt32LE(y.length * 4);
  for (const sample of y) {
    buffer.writeFloat32LE(sample);
  }
  const wav = buffer.toUint8Array();

  await fs.writeFile(`js-${CurrentRuntime}.wav`, wav);
});
