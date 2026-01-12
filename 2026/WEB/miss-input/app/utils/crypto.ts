// TACTICAL SECURITY MODULE v1.0

// Key: M151NPU7_G0D
const xor = (text: string, key: string): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

const fromHex = (hex: string) => {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
}

export const SECURE_PAYLOAD_V2 = "1f6466740d2b0c070a187370017c6a757e071b686e70051b0c6e78007b611b670a704d";

export const decryptFlag = (key: string): string => {
  try {
    const raw = fromHex(SECURE_PAYLOAD_V2);
    const decrypted = xor(raw, key);
    console.log("DEBUG: Decrypted attempt:", decrypted);
    
    if (decrypted.startsWith("RUSEC{")) {
        return decrypted;
    }
    return "ACCESS DENIED: INVALID KEY DETECTED. SYSTEM LOCKDOWN IMMINENT.";
  } catch (e) {
    return "SYSTEM ERROR: DECRYPTION FAILED.";
  }
};
