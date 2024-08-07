const SIZE_MULTIPLIERS = {
  kb: 1,
  mb: 1024,
  gb: 1024 * 1024,
  tb: 1024 * 1024 * 1024,
};

export function convertToFileSize(input: string): number | null {
  const match = input.match(/^(\d+)(\s?)([tkmg]?b)$/i);
  if (!match) {
    return null;
  }

  const size = parseInt(match[1]);
  const unit = match[3].toLowerCase();
  if (!SIZE_MULTIPLIERS[unit]) {
    return null;
  }

  return size * SIZE_MULTIPLIERS[unit];
}
