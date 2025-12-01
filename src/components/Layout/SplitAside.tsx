import { Close } from '@mui/icons-material';
import { Slide, styled } from '@mui/material';
import { PropsWithChildren } from 'react';

interface Props {
  open: boolean;
  width?: number;
  zIndex?: number;
  onClose: () => void;
}

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flexShrink: 0,
  position: 'fixed',
  top: 0,
  bottom: 0,
  right: 0,
  marginLeft: 'auto',
  maxHeight: '100vh',
  backgroundColor: 'white',
  boxShadow: '-4px 0px 20px 0px rgba(0, 0, 0, 0.10)',
});

const CloseIconContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  background: theme.palette.grey[700],
  left: -28,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 28,
  width: 28,
  top: 40,
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
  boxShadow: theme.shadows[18],
  cursor: 'pointer',
}));

const SplitAside = ({ children, onClose, width, open, zIndex = 1200 }: PropsWithChildren<Props>) => {
  return (
    <Slide in={open} direction="left" style={{ position: 'absolute', right: 0, top: 0, width: width ?? 300, zIndex }}>
      <Container sx={{ maxWidth: width ?? 300 }}>
        <CloseIconContainer onClick={onClose}>
          <Close sx={{ color: 'white' }} />
        </CloseIconContainer>
        {children}
      </Container>
    </Slide>
  );
};

export default SplitAside;
