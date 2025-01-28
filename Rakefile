# frozen_string_literal: true

patch_bin = ENV.fetch("PATCH", "patch")
emcmake_bin = ENV.fetch("EMCMAKE", "emcmake")
emcmake_cmake_bin = ENV.fetch("EMCMAKE_CMAKE", "cmake")
cmake_bin = ENV.fetch("CMAKE", "cmake")

task default: %w[build]

desc "Build the project"
task build: %w[
       build:copy
       build:patch_worldline
       build:cmake
       build:patch_artifact
     ]

desc "Copy files"
task "build:copy" do
  require "fileutils"
  puts "Copying files"

  FileUtils.mkdir_p "worldline", verbose: true
  FileUtils.cp_r Dir.glob("./deps/OpenUtau/cpp/.", flags: File::FNM_DOTMATCH),
                 "./worldline/.",
                 preserve: true,
                 verbose: true
end

desc "Patch Worldline"
task "build:patch_worldline" do
  sh "#{patch_bin} -p1 < #{__dir__}/patches/worldline.patch", chdir: "worldline"
end

desc "Build with CMake"
task "build:cmake", [:debug] do |_t, args|
  puts "Building with CMake"

  sh "#{emcmake_bin} #{emcmake_cmake_bin} -S . -B build -DCMAKE_BUILD_TYPE=#{args[:debug] ? "Debug" : "Release"}"
  sh "#{cmake_bin} --build build"
end

desc "Patch artifact"
task "build:patch_artifact" do
  worldline_base = File.read("build/worldline.js")
  worldline_base.gsub!('import("module")', 'import("node:module")')
  entry = worldline_base.index("var moduleRtn")
  worldline_base.insert(
    entry,
    "let Buffer = globalThis.Buffer;if(!Buffer){Buffer = await import('node:buffer').then(m => m.Buffer);}\n"
  )

  File.write("worldline.js", worldline_base)
end

desc "Clean the project"
task "clean" do
  require "fileutils"
  FileUtils.rm_rf "worldline", verbose: true
  FileUtils.rm_rf "build", verbose: true
end

desc "Download Lunamira's UTAU voicebank"
task "test:download" do
  # https://tyc.rei-yumesaki.net/files/voice/tyc-utau.zip
  require "open-uri"
  require "fileutils"

  FileUtils.mkdir_p "deps/tyc-utau", verbose: true
  unless File.exist?("deps/tyc-utau/tyc-utau.zip")
    puts "Downloading tyc-utau.zip"
    URI.open("https://tyc.rei-yumesaki.net/files/voice/tyc-utau.zip") do |f|
      File.binwrite "deps/tyc-utau/tyc-utau.zip", f.read
    end
  end

  sh "unzip -O sjis deps/tyc-utau/tyc-utau.zip -d deps/tyc-utau"
end

desc "Generate NOTICE.md"
task "notice" do
  File.write("NOTICE.md", <<~MARKDOWN)
  # Notice

  ## Worldline

  Worldline is a resampler included in OpenUtau. It is licensed under the MIT license.

  ```txt
  #{File.read("deps/OpenUtau/LICENSE.txt")}
  ```

  MARKDOWN
end
