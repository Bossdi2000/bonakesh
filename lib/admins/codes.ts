const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I/O/0/1 to avoid confusion

/** Generates a single human-friendly code like "K7QD-M2PX". */
export function generateCode(): string {
  let s = ""
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    if (i === 3) s += "-"
  }
  return s
}

/** Generates n unique codes (used to batch-create a fresh set). */
export function generateCodes(n: number): string[] {
  const out = new Set<string>()
  while (out.size < n) {
    out.add(generateCode())
  }
  return Array.from(out)
}
