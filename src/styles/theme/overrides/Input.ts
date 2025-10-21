import { Components, Theme } from '@mui/material';

function Input(): Partial<Components<Theme>> {
  return {
    MuiInputBase: {
      defaultProps: {},
    },
  };
}

export default Input;
