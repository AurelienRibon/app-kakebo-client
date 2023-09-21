const UUID_ALPHABET_1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const UUID_ALPHABET_2 = UUID_ALPHABET_1 + '0123456789';

export function guid(): string {
  const chars = new Array(8);
  chars[0] = UUID_ALPHABET_1[randInt(UUID_ALPHABET_1.length)];

  for (let i = 1; i < chars.length; ++i) {
    chars[i] = UUID_ALPHABET_2[randInt(UUID_ALPHABET_2.length)];
  }

  return chars.join('');
}

export function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function px(value: number): string {
  return `${value}px`;
}

export function str(value: unknown): string {
  return JSON.stringify(value);
}

export function sum(items: number[]): number {
  return items.reduce((acc, it) => acc + it, 0);
}

export function mapGroups<T, K, J>(groups: [T, K][], fn: (key: T, val: K) => J): [T, J][] {
  return groups.map((it) => [it[0], fn(it[0], it[1])]);
}
