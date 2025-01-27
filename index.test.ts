import { BinaryWriter } from "@sevenc-nanashi/binaryseeker";
import { parseOtoIniLine, PhraseSynth, SynthRequest } from "./index.ts";

// https://github.com/sevenc-nanashi/Cantari/blob/main/crates/worldline/tests/main_test.rs
Deno.test("Hello World", async () => {
  const phraseSynth = new PhraseSynth();
  const cvcRoot =
    "./deps/tyc-utau/つくよみちゃんUTAU音源/多音階01：_B3（連続音）";
  const testAudio = `${cvcRoot}/_ああR.wav`;
  const content = await Deno.readFile(testAudio);
  const data = Array.from(new Int16Array(content.slice(44).buffer)).map(
    (x) => x / 32768,
  );

  const frq = await Deno.readTextFile(`${cvcRoot}/_ああR_wav.frq`);

  const otoIniRaw = await Deno.readFile(`${cvcRoot}/oto.ini`);
  const otoIni = new TextDecoder("shift-jis").decode(otoIniRaw);

  const aOto = otoIni
    .split("\n")
    .find((line) => line.startsWith("_ああR.wav="));
  if (!aOto) {
    throw new Error("Cannot find _ああR.wav in oto.ini");
  }

  const aOtoParts = parseOtoIniLine(aOto);
  const request: SynthRequest = {
    sampleFs: 44100,
    samples: data,
    frq,
    tone: 40,
    conVel: 100,
    offset: aOtoParts.offset,
    requiredLength: 1000.0,
    consonant: aOtoParts.consonant,
    cutOff: aOtoParts.cutOff,
    volume: 100.0,
    modulation: 0.0,
    tempo: 0.0,
    pitchBend: [0.0],
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
  buffer.writeUInt32LE(36 + y.length * 4);
  buffer.writeChars("WAVE");
  buffer.writeChars("fmt ");
  buffer.writeUInt32LE(16);
  buffer.writeUInt16LE(1);
  buffer.writeUInt16LE(1);
  buffer.writeUInt32LE(44100);
  buffer.writeUInt32LE(44100 * 2);
  buffer.writeUInt16LE(2);
  buffer.writeUInt16LE(16);
  buffer.writeChars("data");
  buffer.writeUInt32LE(y.length * 4);
  for (const sample of y) {
    buffer.writeFloat32LE(sample);
  }
  const wav = buffer.toUint8Array();
  console.log(y.length);

  await Deno.writeFile("test.wav", wav);
});
