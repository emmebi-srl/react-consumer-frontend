import { Box, styled } from '@mui/material';

const DetailDataCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: 60,
  justifyContent: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export default DetailDataCell;
