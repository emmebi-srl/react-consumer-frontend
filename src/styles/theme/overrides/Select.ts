import { Components, Theme } from '@mui/material';

function Select(): Partial<Components<Theme>> {
  return {
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        MenuProps: {
          autoFocus: false,
          disableAutoFocus: true,
        },
      },
    },
  };
}

export default Select;
