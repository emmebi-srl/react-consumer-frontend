import _isError from 'lodash/isError';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';

type Extra = unknown;
type Extras = Record<string, Extra>;

type ErrorType = 'error' | 'api-error' | 'unknown';
export interface ResolvedError {
  title: string;
  message: string;
  errorType: ErrorType;
  stackTrace?: string;
}

export const resolveError = (error: unknown) => {
  const errorTitle = 'Qualcosa è andato storto';
  let errorBody = 'Si è verificato un errore imprevisto. Se il problema persiste, contattare info@emmebi.tv.it';
  let errorType: ErrorType = 'unknown';
  let stackTrace: string | undefined;

  if (_isError(error)) {
    errorBody = error.message;
    errorType = 'error';
    stackTrace = error.stack;
  }

  return {
    title: errorTitle,
    message: errorBody,
    errorType,
    stackTrace,
  };
};

const captureException = (error: unknown, { extra }: { extra?: Extras } = {}) => {
  const resolvedError = resolveError(error);
  // eslint-disable-next-line no-console
  console.log(resolvedError.title, resolvedError.message, resolvedError, extra);
  console.error(resolvedError.stackTrace ?? error);

  return resolvedError;
};

const result = { captureException };

const useExceptionLogger = () => result;

export default useExceptionLogger;
