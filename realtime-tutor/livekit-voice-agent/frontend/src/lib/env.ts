export function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[env] Missing ${name}`);
  return v;
}