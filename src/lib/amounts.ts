export function formatAmount(amount: number, noSign = false): string {
  const sign = noSign ? '' : amount > 0 ? '+' : '-';
  return sign + Math.abs(amount).toFixed(2);
}

export function addDigitToAmount(oldValue: string, newDigit: string | null): string {
  const oldValueRaw = oldValue.replace('.', '');
  const newValueRaw = newDigit !== null ? oldValueRaw + newDigit : oldValueRaw.slice(0, -1);
  const integer = extractIntegerPart(newValueRaw);
  const decimal = extractDecimalPart(newValueRaw);
  return `${integer}.${decimal}`;
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function extractIntegerPart(value: string): string {
  return value
    .slice(0, -2)
    .replace(/^0+$/, '0')
    .replace(/^0+([1-9])/, '$1')
    .padStart(1, '0');
}

function extractDecimalPart(value: string): string {
  return value.slice(-2).padStart(2, '0');
}
