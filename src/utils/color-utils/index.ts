export const isHexColor = (value: string | null | undefined): value is string =>
  !!value && /^#[0-9a-f]{6}$/i.test(value);

export const normalizeToHexColor = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (/^#?[0-9a-f]{6}$/i.test(trimmedValue)) {
    const hexValue = trimmedValue.startsWith('#') ? trimmedValue.slice(1) : trimmedValue;
    return `#${hexValue.toUpperCase()}`;
  }

  if (/^#?[0-9a-f]{3}$/i.test(trimmedValue)) {
    const shortHexValue = trimmedValue.startsWith('#') ? trimmedValue.slice(1) : trimmedValue;
    return `#${shortHexValue
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toUpperCase()}`;
  }

  if (/^\$[0-9a-f]+$/i.test(trimmedValue)) {
    return oleColorToHex(Number.parseInt(trimmedValue.slice(1), 16));
  }

  if (/^0x[0-9a-f]+$/i.test(trimmedValue)) {
    return oleColorToHex(Number.parseInt(trimmedValue.slice(2), 16));
  }

  if (/^-?\d+$/.test(trimmedValue)) {
    return oleColorToHex(Number.parseInt(trimmedValue, 10));
  }

  return null;
};

export const getReadableTextColor = (backgroundColor: string) => {
  const normalizedColor = backgroundColor.replace('#', '');
  const red = Number.parseInt(normalizedColor.slice(0, 2), 16);
  const green = Number.parseInt(normalizedColor.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance >= 160 ? '#1F2937' : '#FFFFFF';
};

const oleColorToHex = (value: number) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  const unsignedValue = value >>> 0;

  // Delphi/OLE system colors (0x800000xx) depend on the host OS theme.
  // When they appear, we prefer a neutral fallback instead of guessing.
  if ((unsignedValue & 0xff000000) === 0x80000000) {
    return null;
  }

  const red = unsignedValue & 0xff;
  const green = (unsignedValue >>> 8) & 0xff;
  const blue = (unsignedValue >>> 16) & 0xff;

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const toHex = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();
