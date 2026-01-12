const fs = require('fs');
const path = require('path');

// Helper to write unsigned LEB128
function encodeULEB128(value) {
  const bytes = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (value !== 0);
  return bytes;
}

// Helper to write signed LEB128 (for i32.const)
function encodeSLEB128(value) {
    const bytes = [];
    let more = true;
    while (more) {
        let byte = value & 0x7f;
        value >>= 7;
        if ((value === 0 && (byte & 0x40) === 0) || (value === -1 && (byte & 0x40) !== 0)) {
            more = false;
        } else {
            byte |= 0x80;
        }
        bytes.push(byte);
    }
    return bytes;
}

// Helper for strings (length + bytes)
function encodeString(str) {
    const buf = Buffer.from(str, 'utf8');
    return [...encodeULEB128(buf.length), ...buf];
}

// KEY: M151NPU7_G0D (12 chars)
// Split into 3 i32 values (4 chars each, little endian):
// "M151" = 0x3135314D
// "NPU7" = 0x3755504E  
// "_G0D" = 0x44304735 (wait, this doesn't look right for LE)
// Let's recalculate:
// "_G0D" = '_' (0x5F) 'G' (0x47) '0' (0x30) 'D' (0x44)
// Little endian i32: 0x4430475F

// XOR keys for obfuscation (solver must figure these out from the code)
const XOR_KEY_1 = 0xCAFEBABE;
const XOR_KEY_2 = 0xDEADBEEF;
const XOR_KEY_3 = 0xFEEDFACE;

// Pre-compute XORed values
const PART1_RAW = 0x3135314D; // "M151"
const PART2_RAW = 0x3755504E; // "NPU7"  
const PART3_RAW = 0x4430475F; // "_G0D"

const PART1_XOR = PART1_RAW ^ XOR_KEY_1; // solver must XOR to get original
const PART2_XOR = PART2_RAW ^ XOR_KEY_2;
const PART3_XOR = PART3_RAW ^ XOR_KEY_3;

console.log("Key parts (raw):", PART1_RAW.toString(16), PART2_RAW.toString(16), PART3_RAW.toString(16));
console.log("Key parts (XOR'd):", PART1_XOR.toString(16), PART2_XOR.toString(16), PART3_XOR.toString(16));

// Function 1: get_part1(xor_key) -> i32
// Returns PART1_XOR ^ xor_key (solver must pass XOR_KEY_1 to get PART1_RAW)
const func1Body = [
    0x41, ...encodeSLEB128(PART1_XOR),  // i32.const PART1_XOR
    0x20, 0x00,                          // local.get 0 (the xor key param)
    0x73,                                // i32.xor
    0x0B                                 // end
];

// Function 2: get_part2(xor_key) -> i32
const func2Body = [
    0x41, ...encodeSLEB128(PART2_XOR),
    0x20, 0x00,
    0x73,
    0x0B
];

// Function 3: get_part3(xor_key) -> i32
const func3Body = [
    0x41, ...encodeSLEB128(PART3_XOR),
    0x20, 0x00,
    0x73,
    0x0B
];

// WASM header
const head = [0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00];

// Type section: func (i32) -> i32
const typeSectionData = [
    0x01, // 1 type
    0x60, 0x01, 0x7F, 0x01, 0x7F
];
const typeSection = [0x01, ...encodeULEB128(typeSectionData.length), ...typeSectionData];

// Function section: 3 functions, all type 0
const funcSectionData = [0x03, 0x00, 0x00, 0x00];
const funcSection = [0x03, ...encodeULEB128(funcSectionData.length), ...funcSectionData];

// Export section: export all 3 functions with cryptic names
const export1 = encodeString("_0x1");
const export2 = encodeString("_0x2");
const export3 = encodeString("_0x3");
const exportSectionData = [
    0x03, // 3 exports
    ...export1, 0x00, 0x00,
    ...export2, 0x00, 0x01,
    ...export3, 0x00, 0x02
];
const exportSection = [0x07, ...encodeULEB128(exportSectionData.length), ...exportSectionData];

// Code section: 3 function bodies
const funcLocalDecl = [0x00]; // 0 locals

const body1 = [...funcLocalDecl, ...func1Body];
const body2 = [...funcLocalDecl, ...func2Body];
const body3 = [...funcLocalDecl, ...func3Body];

const entry1 = [...encodeULEB128(body1.length), ...body1];
const entry2 = [...encodeULEB128(body2.length), ...body2];
const entry3 = [...encodeULEB128(body3.length), ...body3];

const codeSectionData = [0x03, ...entry1, ...entry2, ...entry3];
const codeSection = [0x0A, ...encodeULEB128(codeSectionData.length), ...codeSectionData];

// Custom section with OBFUSCATED hint (XOR'd with 0x42)
const hintPlain = "XOR_KEYS: 0xCAFEBABE, 0xDEADBEEF, 0xFEEDFACE";
const hintXor = Buffer.from(hintPlain).map(b => b ^ 0x42);
const customSectionName = encodeString("dbg");
const customSectionData = [...customSectionName, ...hintXor];
const customSection = [0x00, ...encodeULEB128(customSectionData.length), ...customSectionData];

const wasmBytes = Buffer.from([
    ...head,
    ...customSection,
    ...typeSection,
    ...funcSection,
    ...exportSection,
    ...codeSection
]);

const outPath = path.join(__dirname, 'public', 'challenge.wasm');
fs.writeFileSync(outPath, wasmBytes);
console.log(`Wrote ${wasmBytes.length} bytes to ${outPath}`);

// Print solver hint for verification
console.log("\n=== SOLVER INFO ===");
console.log("Call _0x1(0xCAFEBABE) to get Part 1");
console.log("Call _0x2(0xDEADBEEF) to get Part 2");
console.log("Call _0x3(0xFEEDFACE) to get Part 3");
console.log("Convert each i32 to 4-char string (little endian)");
console.log("Concatenate to get key: M151NPU7_G0D");
