export type LendingInput = {
  avgDailyRevenue: number;
  transactionCount: number;
  growthRate: number;
  onTimeRepaymentRate: number;
};

export type LendingResult = {
  score: number;
  riskLevel: "low" | "medium" | "high";
  approved: boolean;
  suggestedAmount: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateLendingScore(input: LendingInput): LendingResult {
  const revenueFactor = clamp(input.avgDailyRevenue / 2_000_000, 0, 1) * 35;
  const frequencyFactor = clamp(input.transactionCount / 200, 0, 1) * 25;
  const growthFactor = clamp((input.growthRate + 0.2) / 0.6, 0, 1) * 20;
  const paymentFactor = clamp(input.onTimeRepaymentRate, 0, 1) * 20;

  const score = Math.round(revenueFactor + frequencyFactor + growthFactor + paymentFactor);
  let riskLevel: "low" | "medium" | "high" = "high";
  if (score >= 75) riskLevel = "low";
  else if (score >= 50) riskLevel = "medium";

  const approved = score >= 55;
  const baseAmount = input.avgDailyRevenue * 7;
  const multiplier = riskLevel === "low" ? 2 : riskLevel === "medium" ? 1.2 : 0.6;
  const suggestedAmount = Math.max(500_000, Math.round(baseAmount * multiplier / 100_000) * 100_000);

  return { score, riskLevel, approved, suggestedAmount };
}

export function calculateLoanInterest(amount: number, tenorDays: number) {
  const tenorRate = tenorDays <= 7 ? 0.03 : tenorDays <= 14 ? 0.05 : 0.08;
  const interest = Math.round(amount * tenorRate);
  return { interestRate: tenorRate, totalRepayment: amount + interest, interest };
}
