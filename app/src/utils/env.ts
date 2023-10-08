export function env(name: string, fallback: string): string {
  const value = process.env[name];

  return value !== undefined ? value : fallback;
}
