import { Components, Theme } from '@mui/material';

function TextField(): Partial<Components<Theme>> {
  return {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  };
}

export default TextField;
