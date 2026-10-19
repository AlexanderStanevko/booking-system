const numberFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
