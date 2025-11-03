import { Typography, styled } from '@mui/material';

export const MainLabel = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '22px',
  color: theme.palette.text.primary,
}));

export const ErrorLabel = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '22px',
  color: theme.palette.error.main,
}));

export const MonospaceMainLabel = styled(MainLabel)({ fontVariantNumeric: 'tabular-nums', letterSpacing: -0.8 });

export const SecondaryLabel = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.palette.text.secondary,
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '22px',
}));

export const MonospaceSecondaryLabel = styled(SecondaryLabel)({
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: -0.8,
});
