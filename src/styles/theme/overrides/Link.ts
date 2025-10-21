import { Components, Theme } from '@mui/material';

function Link(theme: Theme): Partial<Components<Theme>> {
  return {
    MuiLink: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          textDecorationColor: theme.palette.text.primary,
          '&:hover': {
            color: theme.palette.primary.main,
            textDecorationColor: theme.palette.primary.main,
          },
        },
      },
    },
  };
}

export default Link;
