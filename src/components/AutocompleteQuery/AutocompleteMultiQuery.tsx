import React, { useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Autocomplete, Chip, CircularProgress, FormHelperText, Grid, TextField } from '@mui/material';
import _isArray from 'lodash/isArray';
import _isString from 'lodash/isString';

export interface AutocompleteMultiQueryProps<TValue extends {}, TQueryData extends {}, TQueryParams extends {} = {}> {
  label: string;
  value: TValue[];
  onSelect: (val: TQueryData) => void;
  queryParams?: TQueryParams;
  queryFunc: (searchText: string, queryParams?: TQueryParams) => { data: TQueryData[] | undefined; isLoading: boolean };
  getOptionLabel: (option: TValue | TQueryData) => string;
  onMultipleDelete?: (index: number) => void;
  error?: string | string[]; // string | ReactNode | null;
  disabled: boolean;
}

const AutocompleteMultiQuery = <TValue extends {}, TQueryData extends {}, TQueryParams extends {} = {}>({
  label,
  value,
  error,
  disabled,
  onSelect,
  queryFunc,
  queryParams,
  getOptionLabel,
  onMultipleDelete,
}: AutocompleteMultiQueryProps<TValue, TQueryData, TQueryParams>) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedValue] = useDebounce(searchText, 500);
  const query = queryFunc(debouncedValue, queryParams);
  const textRef = useRef<HTMLInputElement>(null);
  return (
    <Grid container spacing={2} direction={'column'}>
      <Grid>
        <Autocomplete<TQueryData>
          loading={query.isLoading}
          options={query.data || []}
          autoHighlight
          getOptionLabel={getOptionLabel}
          onChange={(e, val) => {
            if (val) onSelect(val);
          }}
          blurOnSelect
          onInputChange={(event, newInputValue, type) => {
            if (type === 'reset') {
              setSearchText('');
              textRef.current?.focus();
            } else {
              setSearchText(newInputValue);
            }
          }}
          inputValue={searchText}
          renderInput={(params) => (
            <TextField
              inputRef={textRef}
              {...params}
              disabled={disabled}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {query.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
              label={label}
            />
          )}
        />
      </Grid>
      <Grid container spacing={2}>
        {value.map((option, index) => (
          <Grid key={index}>
            <Chip
              variant="outlined"
              disabled={disabled}
              label={getOptionLabel(option)}
              onDelete={() => onMultipleDelete?.(index)}
            />
          </Grid>
        ))}
      </Grid>
      {!!error && (
        <FormHelperText error>
          {_isArray(error) ? error.map((el) => (_isString(el) ? el : JSON.stringify(el))).join(', ') : error}
        </FormHelperText>
      )}
    </Grid>
  );
};

export default AutocompleteMultiQuery;
