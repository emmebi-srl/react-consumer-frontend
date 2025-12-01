import { Box, styled, SxProps } from '@mui/material';
import { PropsWithChildren } from 'react';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  padding: theme.spacing(3),
}));

export const AsideContentView = ({ children, sx }: PropsWithChildren<{ sx?: SxProps }>) => {
  return <Container sx={sx}>{children}</Container>;
};
