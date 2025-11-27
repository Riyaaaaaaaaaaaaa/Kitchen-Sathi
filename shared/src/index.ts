export function formatGreeting(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `Hello, ${trimmed}!` : 'Hello!';
}

