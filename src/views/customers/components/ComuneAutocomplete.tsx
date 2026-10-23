import { useState } from 'react';
import { Autocomplete, SxProps, TextField, Theme } from '@mui/material';
import { useComuneSearch } from '~/proxies/aries-proxy/geo';
import { Comune } from '~/types/aries-proxy/geo';

interface Props {
  /** Selected comune id, '' when none. */
  value: number | '';
  /** Comune already saved on the record, shown while `value` still points to it. */
  initialComune?: Comune | null;
  onChange: (comune: Comune | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const ComuneAutocomplete: React.FC<Props> = ({
  value,
  initialComune,
  onChange,
  required,
  error,
  helperText,
  fullWidth,
  size = 'small',
  sx,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedComune, setSelectedComune] = useState<Comune | null>(null);
  const comuneQuery = useComuneSearch(searchText);

  // Derived from the form value, so resetting the form also resets the shown comune.
  const currentComune =
    value === ''
      ? null
      : selectedComune?.id === value
        ? selectedComune
        : initialComune?.id === value
          ? initialComune
          : null;

  return (
    <Autocomplete
      options={comuneQuery.data?.comuni ?? []}
      value={currentComune}
      loading={comuneQuery.isLoading}
      filterOptions={(options) => options}
      getOptionLabel={(option) => `${option.name}${option.province ? ` (${option.province})` : ''}`}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onChange={(_event, comune) => {
        setSelectedComune(comune);
        onChange(comune);
      }}
      onInputChange={(_event, text, reason) => {
        if (reason !== 'reset') setSearchText(text);
      }}
      fullWidth={fullWidth}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          size={size}
          label="Comune"
          error={error}
          helperText={helperText ?? 'Digita almeno 2 lettere'}
        />
      )}
    />
  );
};

export default ComuneAutocomplete;
