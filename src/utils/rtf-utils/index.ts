// RTF helpers for rich-text fields written by the Delphi desktop app (quote bodies, product notes...).
// The web app edits them as plain text: decode for display/editing, re-encode only when the user
// actually changed the text (re-encoding drops the original Delphi formatting).

const rtfControlDestinations = new Set(['colortbl', 'fonttbl', 'info', 'pict', 'stylesheet']);

export const decodeRtf = (value?: string | null) => {
  if (!value) return '';
  if (!value.trimStart().startsWith('{\\rtf')) return value;

  const stack: boolean[] = [];
  let ignore = false;
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '{') {
      const groupStart = /^\\\*?([a-zA-Z]+)/.exec(value.slice(index + 1));
      const destination = groupStart?.[1] ?? '';
      stack.push(ignore);
      ignore = ignore || rtfControlDestinations.has(destination);
      continue;
    }

    if (char === '}') {
      ignore = stack.pop() ?? false;
      continue;
    }

    if (ignore) continue;

    if (char !== '\\') {
      if (char !== '\r' && char !== '\n') result += char;
      continue;
    }

    const next = value[index + 1];
    if (next === '\\' || next === '{' || next === '}') {
      result += next;
      index += 1;
      continue;
    }

    if (next === "'") {
      const hex = value.slice(index + 2, index + 4);
      const code = Number.parseInt(hex, 16);
      if (!Number.isNaN(code)) result += String.fromCharCode(code);
      index += 3;
      continue;
    }

    const match = /^([a-zA-Z]+)(-?\d+)? ?/.exec(value.slice(index + 1));
    if (!match) {
      index += 1;
      continue;
    }

    const [, word, parameter] = match;
    if (word === 'par' || word === 'line') result += '\n';
    if (word === 'tab') result += '\t';

    index += match[0].length;

    if (word === 'u' && parameter) {
      const code = Number(parameter);
      result += String.fromCharCode(code < 0 ? code + 65536 : code);
      // Skip the ANSI fallback character that follows \uN (\uc1, as written by encodeRtfText and Delphi).
      const fallback = value[index + 1];
      if (fallback !== undefined && fallback !== '\\' && fallback !== '{' && fallback !== '}') index += 1;
    }
  }

  return result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
};

export const encodeRtfText = (value: string) => {
  const encodeChar = (char: string) => {
    if (char === '\\' || char === '{' || char === '}') return `\\${char}`;

    const code = char.charCodeAt(0);
    if (code > 127) {
      const signedCode = code > 32767 ? code - 65536 : code;
      return `\\u${signedCode}?`;
    }

    return char;
  };

  const body = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.split('').map(encodeChar).join(''))
    .join('\\par\n');

  return `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0\\fnil Arial;}}\\viewkind4\\uc1\\f0\\fs20 ${body}}`;
};
