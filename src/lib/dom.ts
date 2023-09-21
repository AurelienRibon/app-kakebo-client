export function hideKeyboard(): void {
  if (document.activeElement instanceof HTMLInputElement) {
    document.activeElement.blur();
  }
}

export function genColor(string: string, saturation = 100, lightness = 72): string {
  if (string === '...') {
    return '#ccc';
  }

  let hash = 0;

  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
}
