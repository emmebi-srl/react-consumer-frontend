import { ArrowUpward } from '@mui/icons-material';
import { Icon, styled } from '@mui/material';

interface Props {
  onClick: () => void;
  visible: boolean;
}

const Container = styled('div')(({ theme }) => ({
  height: 32,
  padding: '0 12px 0 8px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  right: 48,
  bottom: 148,
  zIndex: 1200,
  cursor: 'pointer',
  borderRadius: 25,
  color: 'white',
  gap: 8,
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: '22px',
  boxShadow: `0px 8px 16px 0px ${theme.palette.primary.main}33`,
}));

const ScrollToTopButton: React.FC<Props> = ({ onClick, visible }) => {
  return (
    <Container onClick={onClick} sx={{ display: visible ? 'flex' : 'none' }}>
      <Icon component={ArrowUpward} fontSize="small" />
      TORNARE IN CIMA
    </Container>
  );
};

export default ScrollToTopButton;
