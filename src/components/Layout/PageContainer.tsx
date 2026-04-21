import { CSSProperties, PropsWithChildren } from 'react';
import { Container, ContainerProps } from '@mui/material';

interface Props {
  fullWidth?: boolean;
  dataTestId?: string;
  style?: CSSProperties;
  sx?: ContainerProps['sx'];
}

const PageContainer: React.FC<PropsWithChildren<Props>> = ({ children, sx, style, fullWidth }) => {
  return (
    <Container
      sx={{
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 0,
        height: '100%',
        width: '100%',
        py: 2,
        ...sx,
      }}
      maxWidth={fullWidth ? false : 'xl'}
      style={style}
    >
      {children}
    </Container>
  );
};

export default PageContainer;
