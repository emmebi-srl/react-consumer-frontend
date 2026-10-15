import { describe, expect, it } from 'vitest';
import { decodeRtf, encodeRtfText } from '.';

describe('rtf-utils', () => {
  it('returns plain text unchanged', () => {
    expect(decodeRtf('Batteria 12V')).toBe('Batteria 12V');
    expect(decodeRtf(null)).toBe('');
  });

  it('decodes Delphi RTF ignoring font/color tables', () => {
    const rtf =
      '{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0\\fnil Tahoma;}}{\\colortbl ;\\red0\\green0\\blue0;}' +
      "\\viewkind4\\uc1\\pard\\f0\\fs16 Prima riga\\par Seconda \\'e8 ok\\par}";
    expect(decodeRtf(rtf)).toBe('Prima riga\nSeconda è ok');
  });

  it('round-trips text with accents, unicode and special characters', () => {
    const text = 'Città {test} \\ path\nUmidità 90%\nEuro €';
    expect(decodeRtf(encodeRtfText(text))).toBe(text);
  });
});
