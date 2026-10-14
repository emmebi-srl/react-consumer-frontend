import { describe, expect, it } from 'vitest';
import { normalizeToHexColor } from '.';

describe('normalizeToHexColor', () => {
  it('converts Delphi named colors case-insensitively', () => {
    expect(normalizeToHexColor('clRed')).toBe('#FF0000');
    expect(normalizeToHexColor('CLMONEYGREEN')).toBe('#C0DCC0');
    expect(normalizeToHexColor(' clSkyBlue ')).toBe('#A6CAF0');
  });

  it('converts Delphi $BBGGRR hex and decimal values', () => {
    expect(normalizeToHexColor('$000000FF')).toBe('#FF0000');
    expect(normalizeToHexColor('$00FF0000')).toBe('#0000FF');
    expect(normalizeToHexColor('255')).toBe('#FF0000');
  });

  it('keeps CSS hex colors', () => {
    expect(normalizeToHexColor('#00ff00')).toBe('#00FF00');
  });

  it('returns null for system colors, unknown names and empty values', () => {
    expect(normalizeToHexColor('clBtnFace')).toBeNull();
    expect(normalizeToHexColor('$8000000F')).toBeNull();
    expect(normalizeToHexColor('ATTIVO')).toBeNull();
    expect(normalizeToHexColor('')).toBeNull();
    expect(normalizeToHexColor(null)).toBeNull();
  });
});
