# frozen_string_literal: true

patch_bin = ENV.fetch("PATCH", "patch")
emcmake_bin = ENV.fetch("EMCMAKE", "emcmake")
emcmake_cmake_bin = ENV.fetch("EMCMAKE_CMAKE", "cmake")
cmake_bin = ENV.fetch("CMAKE", "cmake")
task default: %w[build]
task build: %w[build:copy build:patch build:cmake]
task "build:copy" do
  require "fileutils"
  puts "Copying files"

  FileUtils.mkdir_p "worldline", verbose: true
  FileUtils.cp_r Dir.glob("./deps/OpenUtau/cpp/*", flags: File::FNM_DOTMATCH),
                 "./worldline",
                 verbose: true
end
task "build:patch" do
  sh "#{patch_bin} -p1 < #{__dir__}/patches/worldline.patch", chdir: "worldline"
end
task "build:cmake" do
  puts "Building with CMake"

  sh "#{emcmake_bin} #{emcmake_cmake_bin} -S . -B build"
  sh "#{cmake_bin} --build build"
end

task "clean" do
  require "fileutils"
  FileUtils.rm_rf "worldline", verbose: true
  FileUtils.rm_rf "build", verbose: true
end

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
