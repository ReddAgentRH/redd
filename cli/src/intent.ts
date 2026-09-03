export type Intent =
  | { kind: "portfolio" }
  | { kind: "price"; token: string }
  | { kind: "gas" }
  | { kind: "buy"; token: string; amountUsd: number }
  | { kind: "unknown"; text: string };

export interface IntentParser {
  parse(text: string): Intent;
}

export class RuleIntentParser implements IntentParser {
  parse(text: string): Intent {
    const t = text.trim();
    const low = t.toLowerCase();

    if (/\b(portfolio|balance|holdings)\b/.test(low)) return { kind: "portfolio" };
    if (/\bgas\b/.test(low)) return { kind: "gas" };

    const buy = low.match(/buy\s+\$?(\d+(?:\.\d+)?)\s+(?:of\s+)?([a-z0-9]+)/i);
    if (buy) return { kind: "buy", token: buy[2].toUpperCase(), amountUsd: Number(buy[1]) };

    const price = low.match(/(?:price|how much is)\s+([a-z0-9]+)/i);
    if (price) return { kind: "price", token: price[1].toUpperCase() };

    return { kind: "unknown", text: t };
  }
}
