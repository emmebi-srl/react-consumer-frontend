import { styled } from '@mui/material';
import { PropsWithChildren, forwardRef } from 'react';

interface Props {
  sidebarOpen?: boolean;
}

const Container = styled('div')({
  flexBasis: 0,
  flexShrink: 1,
  flexGrow: 1,
  minWidth: 0,
  height: '100%',
  overflow: 'auto',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
});

const SplitMain = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(({ sidebarOpen, children }, ref) => {
  return (
    <Container sx={{ marginRight: sidebarOpen ? '0px' : undefined }} ref={ref}>
      {children}
    </Container>
  );
});

export default SplitMain;
