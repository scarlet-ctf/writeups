const puppeteer = require('puppeteer');
const fs = require('fs');

// ============================================================================
// TACTICAL SOLVER: MISS-INPUT (HARDENED WASM EDITION)
// ============================================================================
//
// CHALLENGE OVERVIEW:
// 1. The website loads a WebAssembly (WASM) binary: /challenge.wasm
// 2. This binary contains the logic to reveal part of the flag, but it's obfuscated.
// 3. The keys to unlock the logic are hidden inside a "Custom Section" of the WASM file.
// 4. This script automates the Reverse Engineering process:
//    a) Downloads the WASM binary.
//    b) Parses the binary structure to find the hidden 'dbg' section.
//    c) Decrypts the hint in that section (XOR obfuscation).
//    d) Extracts the keys and solves the challenge.
// ============================================================================

(async () => {
  console.log('[*] Launching Tactical Solver (Auto-Reversing Edition)...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log('[*] Navigating to target system (http://localhost:3001)...');
  await page.goto('http://localhost:3001');

  // --------------------------------------------------------------------------
  // STEP 1: DOWNLOAD THE BINARY
  // --------------------------------------------------------------------------
  // We use Puppeteer to fetch the file just like the browser would.
  console.log('[*] Intercepting WASM binary...');
  const wasmBuffer = await page.evaluate(async () => {
      const resp = await fetch('/challenge.wasm');
      const buf = await resp.arrayBuffer();
      return Array.from(new Uint8Array(buf));
  });
  
  const binary = new Uint8Array(wasmBuffer);
  console.log(`[+] Downloaded ${binary.length} bytes.`);

  // --------------------------------------------------------------------------
  // STEP 2: PARSE THE WASM BINARY
  // --------------------------------------------------------------------------
  // WASM binary format consists of a Header (8 bytes) followed by Sections.
  // Each Section has: ID (1 byte) | Size (ULEB128) | Content
  // We are looking for Section ID 0 (Custom Section).
  
  let offset = 8; // Skip Magic(4 bytes) + Version(4 bytes)
  let foundHint = null;

  console.log('[*] Parsing WASM structure...');

  while (offset < binary.length) {
      const sectionId = binary[offset++];
      
      // Parse Section Size (ULEB128 - Variable Length Integer)
      let size = 0;
      let shift = 0;
      while (true) {
          const b = binary[offset++];
          size |= (b & 0x7F) << shift;
          if ((b & 0x80) === 0) break; // Last byte has high bit 0
          shift += 7;
      }
      
      const sectionStart = offset;
      
      // Section ID 0 is a "Custom Section" which allows embedding arbitrary data.
      // This is often used for debugging info, or in this case, hiding secrets.
      if (sectionId === 0) { 
          // Custom Sections start with a "Name" string (Length + Bytes)
          
          // Read Name Length
          let nameLen = 0;
          shift = 0;
           while (true) {
              const b = binary[offset++];
              nameLen |= (b & 0x7F) << shift;
              if ((b & 0x80) === 0) break;
              shift += 7;
          }
          
          // Read Name String
          const nameBytes = binary.slice(offset, offset + nameLen);
          const name = new TextDecoder().decode(nameBytes);
          offset += nameLen;
          
          // Check if this is the section we are looking for ('dbg')
          if (name === 'dbg') {
              console.log('[+] FOUND TARGET SECTION: "dbg"');
              const contentLen = size - (offset - sectionStart);
              foundHint = binary.slice(offset, offset + contentLen);
              break; // Stop parsing, we found it
          }
      }
      
      // Jump to next section if this wasn't it
      offset = sectionStart + size;
  }

  if (!foundHint) {
      console.error("[-] Failed to find 'dbg' section. Is this the hardened binary?");
      await browser.close();
      return;
  }

  // --------------------------------------------------------------------------
  // STEP 3: DECRYPT THE HINT
  // --------------------------------------------------------------------------
  // The content of the 'dbg' section is XOR-encoded with 0x42.
  // Simple XOR encryption is common in CTFs to hide text strings from `strings` command.
  
  console.log('[*] Decrypting hint (Applying XOR key: 0x42)...');
  
  let decryptedString = "";
  for (let b of foundHint) {
      decryptedString += String.fromCharCode(b ^ 0x42);
  }
  
  console.log(`[+] DECRYPTED CONTENT:\n    "${decryptedString}"`);

  // Extract the keys from the decrypted text
  // Text format: "XOR_KEYS: 0xCAFEBABE, 0xDEADBEEF, 0xFEEDFACE"
  const hexMatches = decryptedString.match(/0x[0-9A-Fa-f]+/g);
  if (!hexMatches || hexMatches.length < 3) {
      console.error("[-] Failed to parse keys from hint.");
      await browser.close();
      return;
  }

  const keys = hexMatches.map(k => parseInt(k, 16));
  console.log(`[+] EXTRACTED KEYS: ${keys.map(k => '0x' + k.toString(16).toUpperCase()).join(', ')}`);

  // --------------------------------------------------------------------------
  // STEP 4: SOLVE THE CHALLENGE
  // --------------------------------------------------------------------------
  // Usage: The WASM exports 3 functions (_0x1, _0x2, _0x3). 
  // Each function takes one of the keys we found, and returns a part of the true flag.
  
  await page.waitForFunction('window.__TACTICAL_INTEL !== undefined');
  
  const parts = await page.evaluate((k1, k2, k3) => {
    // Calling the WASM functions directly in the browser context
    const intel = window.__TACTICAL_INTEL;
    return {
      part1: intel._0x1(k1),
      part2: intel._0x2(k2),
      part3: intel._0x3(k3)
    };
  }, keys[0], keys[1], keys[2]);

  // Helper to convert the resulting 32-bit integers back to ASCII string (Little Endian)
  function i32ToStr(val) {
    val = val >>> 0; // Ensure unsigned
    return String.fromCharCode(
        val & 0xFF,         // Byte 0
        (val >> 8) & 0xFF,  // Byte 1
        (val >> 16) & 0xFF, // Byte 2
        (val >> 24) & 0xFF  // Byte 3
    );
  }

  const fullKey = i32ToStr(parts.part1) + i32ToStr(parts.part2) + i32ToStr(parts.part3);
  console.log(`[*] RECONSTRUCTED MASTER KEY: ${fullKey}`);
  
  // Submit the key to the main verification function
  const flag = await page.evaluate((k) => {
    return window.__tactical_support_v2(k);
  }, fullKey);

  if (flag && flag.startsWith("RUSEC{")) {
      console.log('\n[+] SUCCESS! FLAG RETRIEVED:');
      console.log('---------------------------------------------------');
      console.log(flag);
      console.log('---------------------------------------------------');
  } else {
      console.log('[-] Failed to retrieve flag. Output:', flag);
  }

  await browser.close();
})();
