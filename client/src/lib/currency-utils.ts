export function formatCurrency(value: number, currencyPair: string): string {
  // Different formatting based on currency pair
  switch (currencyPair) {
    case 'USD/KRW':
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case 'JPY/KRW':
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    case 'USD/JPY':
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    default:
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
  }
}

export function getCurrencySymbol(currencyPair: string): string {
  const [, target] = currencyPair.split('/');
  switch (target) {
    case 'KRW':
      return '₩';
    case 'JPY':
      return '¥';
    case 'USD':
      return '$';
    default:
      return '';
  }
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
