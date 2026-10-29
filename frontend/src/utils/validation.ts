export function exactSumCheck(shares: number[], totalPaisa: number): boolean {
  const sum = shares.reduce((acc, v) => acc + v, 0);
  return sum === totalPaisa;
}

export function percentageSumCheck(percentages: number[]): boolean {
  const sum = percentages.reduce((acc, v) => acc + v, 0);
  return Math.abs(sum - 100) < 0.01;
}

export function requiredField(value: string): string | null {
  return value.trim() === '' ? 'This field is required' : null;
}

export function positiveAmount(value: number): string | null {
  return value <= 0 ? 'Amount must be greater than 0' : null;
}
