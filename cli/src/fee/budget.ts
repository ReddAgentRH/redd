// cli/src/fee/budget.ts
export class FeeBudget {
  private spent = 0;
  constructor(private dailyCapGwei: number) {}

  evaluate(estGwei: number): { decision: "ok" | "queued"; reason: string } {
    if (this.spent + estGwei > this.dailyCapGwei) {
      return { decision: "queued", reason: `would exceed daily fee cap (${this.remaining()} gwei left)` };
    }
    return { decision: "ok", reason: "within daily cap" };
  }

  record(spentGwei: number): void {
    this.spent += spentGwei;
  }

  remaining(): number {
    return Math.max(0, this.dailyCapGwei - this.spent);
  }
}
