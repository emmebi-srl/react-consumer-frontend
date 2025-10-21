import { Typography } from '@mui/material';

const LoadingMore: React.FC<{ label: string }> = ({ label }) => (
  <Typography sx={{ textAlign: 'center', px: 2, py: 4 }} variant="subtitle2">
    {label}
  </Typography>
);

export default LoadingMore;
