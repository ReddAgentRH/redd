import { Wallet, SigningKey } from "ethers";

export async function createKeystore(privateKey: string, password: string): Promise<string> {
  const w = new Wallet(privateKey);
  return await w.encrypt(password);
}

export async function unlockKeystore(
  json: string,
  password: string
): Promise<{ address: string; sign: (digest: string) => Promise<string> }> {
  const w = await Wallet.fromEncryptedJson(json, password);
  const key = new SigningKey(w.privateKey);
  // Return a narrow surface: address + sign only. Do not attach the private key.
  return {
    address: w.address,
    sign: async (digest: string) => key.sign(digest).serialized
  };
}

const HEX_KEY = /\b(0x)?[0-9a-fA-F]{64}\b/;
export function redactSecret(s: string): string {
  return HEX_KEY.test(s) ? "[redacted]" : s;
}
