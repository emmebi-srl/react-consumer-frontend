import { useEffect, useRef } from 'react';
import { Box, Dialog, Typography, useTheme, Button } from '@mui/material';

interface FallbackProps {
  error: Error;
  resetErrorBoundary(): void;
}

export const ErrorBoundaryFallback = (props: FallbackProps) => {
  return <ErrorBoundaryFallbackView {...props} />;
};

const ErrorBoundaryFallbackView = ({ error, resetErrorBoundary }: FallbackProps) => {
  const initialPath = useRef(window.location.pathname);
  const theme = useTheme();

  useEffect(() => {
    if (window.location.pathname !== initialPath.current) {
      resetErrorBoundary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname, resetErrorBoundary]);

  return (
    <Box
      role="alert"
      sx={{
        width: '100%',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h4">Mi dispiace, qualcosa è andato storto</Typography>
      <Box
        component="pre"
        sx={{
          padding: '20px',
          maxWidth: '400px',
          maxHeight: '400px',
          overflow: 'auto',
          whiteSpace: 'normal',
          margin: '20px 0',
          background: theme.palette.grey[200],
          border: `1px solid ${theme.palette.grey[400]}`,
          borderRadius: '8px',
        }}
      >
        {error.message}
      </Box>
      <Button variant="contained" onClick={resetErrorBoundary}>
        Ripristina
      </Button>
    </Box>
  );
};

export const ModalErrorBoundaryFallback = ({ onClose, ...rest }: FallbackProps & { onClose: () => void }) => {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <ErrorBoundaryFallbackView {...rest} />
    </Dialog>
  );
};
