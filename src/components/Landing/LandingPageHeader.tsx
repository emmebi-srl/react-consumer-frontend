import { Box, Chip, ChipProps, Container, ContainerProps, Stack, Typography } from '@mui/material';
import Logo from '~/components/Layout/Logo';

interface LandingPageHeaderProps {
  title: string;
  subtitle: string;
  chipProps?: ChipProps;
  containerMaxWidth?: ContainerProps['maxWidth'];
}

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({
  title,
  subtitle,
  chipProps,
  containerMaxWidth = 'lg',
}) => {
  return (
    <Container maxWidth={containerMaxWidth}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        py={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.5, md: 4 }} alignItems={{ md: 'center' }}>
          <Logo sx={{ height: 60 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Box>
        </Stack>

        {chipProps ? <Chip variant="outlined" {...chipProps} /> : null}
      </Stack>
    </Container>
  );
};

export default LandingPageHeader;
