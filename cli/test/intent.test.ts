import { describe, it, expect } from "vitest";
import { RuleIntentParser } from "../src/intent.js";

const p = new RuleIntentParser();

describe("RuleIntentParser", () => {
  it("parses portfolio", () => {
    expect(p.parse("show my portfolio")).toEqual({ kind: "portfolio" });
    expect(p.parse("balance")).toEqual({ kind: "portfolio" });
  });
  it("parses price", () => {
    expect(p.parse("price RDDT")).toEqual({ kind: "price", token: "RDDT" });
  });
  it("parses gas", () => {
    expect(p.parse("what is gas right now")).toEqual({ kind: "gas" });
  });
  it("parses buy with dollar amount", () => {
    expect(p.parse("buy $200 of RDDT")).toEqual({ kind: "buy", token: "RDDT", amountUsd: 200 });
    expect(p.parse("buy 50 REDD")).toEqual({ kind: "buy", token: "REDD", amountUsd: 50 });
  });
  it("returns unknown otherwise", () => {
    expect(p.parse("make me a sandwich")).toEqual({ kind: "unknown", text: "make me a sandwich" });
  });
});
