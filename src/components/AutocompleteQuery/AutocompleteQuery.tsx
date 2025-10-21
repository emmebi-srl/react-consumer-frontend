import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  FormHelperText,
  Stack,
  SxProps,
  TextField,
} from '@mui/material';

export interface AutocompleteQueryProps<TValue extends number | {}, TQueryData extends {}> {
  label: string;
  value: TValue | null | undefined;
  isOptionEqualToValue?: (option: TQueryData, value: TValue | null | undefined) => boolean;
  onSelect: (val: TQueryData | null) => void;
  queryFunc: (searchText: string) => { data: TQueryData[] | undefined; isLoading: boolean };
  getOptionLabel: (option: TValue | TQueryData) => string;
  getOptionDisabled?: (option: TQueryData) => boolean;
  renderOption?: AutocompleteProps<TQueryData, false, false, false, 'div'>['renderOption'];
  slotProps?: AutocompleteProps<TQueryData, false, false, false, 'div'>['slotProps'];
  error?: string | ReactNode | null;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  sx?: SxProps;
}

const AutocompleteQuery = <TValue extends number | {}, TQueryData extends {}>({
  label,
  value,
  error,
  disabled,
  onSelect,
  isOptionEqualToValue,
  queryFunc,
  getOptionLabel,
  getOptionDisabled,
  renderOption,
  readOnly,
  slotProps,
  loading,
  sx,
}: AutocompleteQueryProps<TValue, TQueryData>) => {
  const [internalValue, setInternalValue] = useState(value);
  const [searchText, setSearchText] = useState(value ? getOptionLabel(value) : '');
  const [debouncedValue] = useDebounce(searchText, 500);
  const query = queryFunc(debouncedValue);

  useEffect(() => {
    setInternalValue(value);
  }, [value, setInternalValue]);

  const textRef = useRef(null);
  return (
    <Stack direction="column" mb={0.25} sx={sx}>
      <Autocomplete<TQueryData>
        loading={query.isLoading}
        options={query.data || []}
        filterOptions={(options) => options}
        autoHighlight
        getOptionLabel={getOptionLabel}
        readOnly={readOnly}
        renderOption={renderOption}
        onChange={(e, val) => {
          onSelect(val);
        }}
        blurOnSelect
        onInputChange={(_, newInputValue, type) => {
          if (type !== 'reset') {
            setSearchText(newInputValue);
          }
        }}
        isOptionEqualToValue={
          isOptionEqualToValue as unknown as ((option: TQueryData, value: TQueryData) => boolean) | undefined
        }
        value={internalValue as unknown as TQueryData}
        getOptionDisabled={getOptionDisabled}
        slotProps={slotProps}
        renderInput={(params) => (
          <TextField
            inputRef={textRef}
            {...params}
            disabled={disabled}
            InputProps={{
              ...params.InputProps,
              readOnly,
              endAdornment: (
                <React.Fragment>
                  {query.isLoading || loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            label={label}
            error={!!error}
          />
        )}
      />
      {error && (
        <FormHelperText sx={{ margin: ' 4px 14px 0' }} error>
          {error}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default AutocompleteQuery;
