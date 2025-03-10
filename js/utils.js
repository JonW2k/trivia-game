// This function hashes the answer using SHA-256 (async)
const hashAnswer = async (answer) => {
    const encoder = new TextEncoder();   // Encode the answer string as bytes
    const data = encoder.encode(answer);  // Create a byte array from the answer

    // Hash the byte array using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash buffer to a hex string
    return arrayBufferToHex(hashBuffer);
}

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    let hexString = '';
    byteArray.forEach(byte => {
        hexString += byte.toString(16).padStart(2, '0');
    });
    return hexString;
}