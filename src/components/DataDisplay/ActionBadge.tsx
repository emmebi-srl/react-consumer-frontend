import { SxProps, styled } from '@mui/material';

interface ActionBadgeProps {
  children: React.ReactNode;
  sx?: SxProps;
}

const BadgeContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '10px',
  padding: 0,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  fontSize: 12,
  fontWeight: 700,
}));

export const ActionBadge = ({ children, sx }: ActionBadgeProps) => {
  return <BadgeContainer sx={sx}>{children}</BadgeContainer>;
};
