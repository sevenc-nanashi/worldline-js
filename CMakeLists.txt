cmake_minimum_required(VERSION 3.27)
project(Worldline)

cmake_policy(SET CMP0077 NEW)
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

include(FetchContent)

set(ABSL_PROPAGATE_CXX_STD ON)
set(WORLD_BUILD_EXAMPLES OFF)
FetchContent_Declare(
  abseil-cpp
  GIT_REPOSITORY https://github.com/abseil/abseil-cpp
  GIT_TAG 20240116.1
  PATCH_COMMAND git apply ${CMAKE_CURRENT_SOURCE_DIR}/patches/abseil.patch
  UPDATE_DISCONNECTED 1)
FetchContent_Declare(
  world
  GIT_REPOSITORY https://github.com/mmorise/World/
  GIT_TAG f8dd5fb289db6a7f7f704497752bf32b258f9151
  PATCH_COMMAND git apply
                ${CMAKE_CURRENT_SOURCE_DIR}/worldline/third_party/world.patch
  UPDATE_DISCONNECTED 1)
FetchContent_Declare(
  npy
  GIT_REPOSITORY https://github.com/llohse/libnpy
  GIT_TAG v1.0.1)
FetchContent_Declare(
  pyin
  GIT_REPOSITORY https://github.com/Sleepwalking/libpyin
  GIT_TAG b38135390b335c3e8cea6ef35cf5093789b36dac
  PATCH_COMMAND git apply
                ${CMAKE_CURRENT_SOURCE_DIR}/worldline/third_party/libpyin.patch
  UPDATE_DISCONNECTED 1)
FetchContent_Declare(
  spline
  GIT_REPOSITORY https://github.com/ttk592/spline
  GIT_TAG 5894beaf91e9adbfdbe5c6c9a1c60770e380e8e8
  PATCH_COMMAND git apply
                ${CMAKE_CURRENT_SOURCE_DIR}/worldline/third_party/spline.patch
  UPDATE_DISCONNECTED 1)
FetchContent_Declare(
  gvps
  GIT_REPOSITORY https://github.com/Sleepwalking/libgvps
  GIT_TAG 2f1b4106d72f8f8138dc447bf0123820c0772cbd)

FetchContent_MakeAvailable(abseil-cpp world npy pyin spline gvps)

set(CMAKE_CXX_STANDARD 17)
add_definitions(-DFP_TYPE=double)

file(GLOB_RECURSE source "worldline/worldline/**/*.cpp"
     "worldline/worldline/*.cpp")
file(GLOB_RECURSE test_source "worldline/worldline/**/*_test.cpp"
     "worldline/worldline/*_test.cpp")

list(REMOVE_ITEM source ${test_source})

add_executable(worldline ${source})
include_directories(worldline)

include_directories(${world_SOURCE_DIR}/tools ${world_SOURCE_DIR}/src)

include_directories(${abseil-cpp_SOURCE_DIR})
target_compile_options(absl_strings PRIVATE -fPIC)
target_compile_options(absl_raw_logging_internal PRIVATE -fPIC)

include_directories(${npy_SOURCE_DIR}/include)

set(gvps_INCLUDE_DIR ${CMAKE_CURRENT_BINARY_DIR}/_deps/gvps-include)
file(MAKE_DIRECTORY ${gvps_INCLUDE_DIR}/libgvps)
file(COPY ${gvps_SOURCE_DIR} DESTINATION ${gvps_INCLUDE_DIR})
file(REMOVE_RECURSE ${gvps_INCLUDE_DIR}/libgvps)
file(RENAME ${gvps_INCLUDE_DIR}/gvps-src ${gvps_INCLUDE_DIR}/libgvps)
include_directories(${gvps_INCLUDE_DIR})
file(GLOB gvps_source ${gvps_SOURCE_DIR}/*.c)
add_library(gvps STATIC ${gvps_source})

include_directories(${pyin_SOURCE_DIR})
file(GLOB pyin_source ${pyin_SOURCE_DIR}/*.c)
add_library(pyin STATIC ${pyin_source})
target_link_libraries(pyin gvps)

include_directories(${spline_SOURCE_DIR}/src)

set(exported_runtime_methods
    ccall
    cwrap
    stackSave
    stackRestore
    stackAlloc
    stringToUTF8
    lengthBytesUTF8
    UTF8ToString
    addFunction)
set(exported_functions ${exported_runtime_methods} _malloc _free)

list(JOIN exported_runtime_methods "','" exported_runtime_methods)
list(JOIN exported_functions "','" exported_functions)

target_link_options(
  worldline
  PRIVATE
  -sMODULARIZE=1
  -sEXPORT_ES6=1
  -sEXPORT_NAME=worldline
  "-sEXPORTED_RUNTIME_METHODS=['${exported_runtime_methods}']"
  "-sEXPORTED_FUNCTIONS=['${exported_functions}']"
  -sWASM=1
  -sUSE_OFFSET_CONVERTER=1
  -sASSERTIONS=2
  -sINVOKE_RUN=0
  -sALLOW_TABLE_GROWTH=1)

target_link_libraries(
  worldline
  absl::debugging
  absl::failure_signal_handler
  absl::time
  absl::strings
  absl::log
  absl::flags
  pyin
  world
  world_tool)
