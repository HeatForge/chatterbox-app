import { describe, expect, it } from "vitest";

import { decrypt, encrypt } from "./crypto";

describe("crypto", () => {
  it("round-trips encrypt and decrypt", () => {
    const plaintext = "sk-test-provider-key-12345";
    const encoded = encrypt(plaintext);
    expect(encoded).not.toBe(plaintext);
    expect(decrypt(encoded)).toBe(plaintext);
  });
});
