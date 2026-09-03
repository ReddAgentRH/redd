// cli/src/memory/root.ts
import { keccak256, toUtf8Bytes } from "ethers";
import { Memory, canonicalize } from "./model.js";

export function memoryRoot(m: Memory): string {
  return keccak256(toUtf8Bytes(canonicalize(m)));
}
