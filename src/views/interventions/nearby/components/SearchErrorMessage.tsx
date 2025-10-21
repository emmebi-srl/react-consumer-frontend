import React from 'react';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';
import { Alert, AlertTitle } from '@mui/material';

const SearchErrorMessage: React.FC<{ error: unknown }> = ({ error }) => {
  if (!error) return null;

  let titleMessage = 'Errore Imprevisto';
  let textMessage = "Attenzione, è stato rilevato un errore imprevisto. Riprovare o contattare l'amministratore.";

  if (
    _isObject(error) &&
    'data' in error &&
    _isObject(error.data) &&
    'message' in error.data &&
    _isString(error.data.message) &&
    error.data.message === 'KO_ADDRESS-NOT_FOUND'
  ) {
    titleMessage = 'Indirizzo non valido';
    textMessage = "Attenzione, l'indirizzo inserito non è stato trovato. Perfavore controllare e riprovare";
  }

  return (
    <Alert severity="error">
      <AlertTitle>{titleMessage}</AlertTitle>
      {textMessage}
    </Alert>
  );
};

export default SearchErrorMessage;
