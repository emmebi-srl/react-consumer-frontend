import { isAxiosError } from 'axios';

// Business validation errors (backend AriesException) come back as HTTP 400 `{ message }`:
// show that message, otherwise fall back to a generic text.
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: unknown }>(error) && error.response?.status === 400) {
    const message = error.response.data.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};
