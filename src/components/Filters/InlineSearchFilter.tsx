import {
  FormControl,
  Icon,
  InputAdornment,
  SxProps,
  TextField,
  TextFieldProps,
  Tooltip,
  styled,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useDebouncedCallback } from 'use-debounce';
import { Close, Search } from '@mui/icons-material';

export interface InlineSearchFilterProps<Filters> {
  value: string;
  customLabel?: string;
  name: keyof Filters;
  onChange: (name: keyof Filters, value: string) => void;
  fullWidth?: boolean;
  size?: TextFieldProps['size'];
  onFocus?: TextFieldProps['onFocus'];
  onBlur?: TextFieldProps['onBlur'];
  dataTestId?: string;
  sx?: SxProps;
}

const StyledFormControl = styled(FormControl)({
  overflow: 'visible',
  minWidth: 150,
  flexBasis: 150,
  flexGrow: 1,
  flexShrink: 1,
});

const InlineSearchFilter = <Filters,>({
  name,
  onChange,
  value,
  customLabel,
  fullWidth,
  size,
  onFocus,
  onBlur,
  sx,
}: InlineSearchFilterProps<Filters>) => {
  const [text, setText] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);

  const debouncedOnSearchFieldChange = useDebouncedCallback<(value: string) => void>(
    (value) => {
      if (value.length === 1) {
        setShowTooltip(true);
        onChange(name, '');
      } else {
        setShowTooltip(false);
        onChange(name, value);
      }
    },
    process.env.NODE_ENV === 'test' ? 5 : 500,
  );

  useEffect(() => {
    setText((text) => {
      // if value change externally (i.e. filters rest) we need to propagate change to the input.
      // There is a legitim case when value change to '' and text have 1 char (we dont fetch for single char)
      if (_isEmpty(value) && text.length === 1) return text;
      return value;
    });
  }, [value]);

  useEffect(() => {
    debouncedOnSearchFieldChange(text);
  }, [debouncedOnSearchFieldChange, text]);

  return (
    <StyledFormControl sx={sx} fullWidth={fullWidth} variant="outlined">
      <Tooltip
        arrow
        title={'Digita almeno due caratteri per cercare'}
        open={showTooltip}
        placement="bottom"
        slotProps={{ tooltip: { style: { top: -8 } } }}
      >
        <TextField
          fullWidth={fullWidth}
          size={size}
          type="text"
          variant="outlined"
          onFocus={onFocus}
          onBlur={onBlur}
          slotProps={{
            input: {
              size,
              endAdornment: text ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onMouseDown={() => {
                      setText('');
                    }}
                  >
                    <Icon component={Close} fontSize={size ?? 'small'} />
                  </IconButton>
                </InputAdornment>
              ) : (
                <InputAdornment position="end">
                  <Icon component={Search} fontSize={size ?? 'small'} />
                </InputAdornment>
              ),
            },
          }}
          label={customLabel ?? 'Cerca'}
          onChange={(event) => {
            setText(event.target.value);
          }}
          value={text}
        />
      </Tooltip>
    </StyledFormControl>
  );
};

export default InlineSearchFilter;
