import lodashIsError from 'lodash/isError';

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== undefined && value !== null;
};

export function assertIsDefined<T>(val: T, errorMsg: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(errorMsg);
  }
}

export function assertIsNotEmpty(
  val: string | null | undefined,
  errorMsg: string,
  allowWhiteSpaces = false,
): asserts val is NonNullable<string> {
  assertIsDefined(val, errorMsg);

  const formattedStr = allowWhiteSpaces ? val : val.trim();
  if (formattedStr === '') {
    throw new Error(errorMsg);
  }
}

export const isError = (error: unknown): error is Error => {
  if (isDefined(error) && lodashIsError(error) && 'stack' in error && 'message' in error) {
    return true;
  }

  return false;
};

export const isInEnum = <E extends Record<string, unknown>>(value: unknown, enumType: E): value is E[keyof E] => {
  return Object.values(enumType).includes(value as E);
};
