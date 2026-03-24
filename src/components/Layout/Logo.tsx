import { Box, BoxProps } from '@mui/material';
import EmmebiLogo from '~/assets/images/emmebi_logo.png';
import SiantelLogo from '~/assets/images/siantel_logo.jpg';

type CompanyEnv = 'emmebi' | 'siantel';

const logoByCompany: Record<CompanyEnv, { alt: string; src: string }> = {
  emmebi: {
    alt: 'Emmebi logo',
    src: EmmebiLogo,
  },
  siantel: {
    alt: 'Siantel logo',
    src: SiantelLogo,
  },
};

const getCompanyEnv = (): CompanyEnv => {
  if (import.meta.env.VITE_COMPANY_ENV === 'siantel') {
    return 'siantel';
  }

  return 'emmebi';
};

const Logo: React.FC<BoxProps> = ({ sx, ...props }) => {
  const logo = logoByCompany[getCompanyEnv()];

  return (
    <Box
      component="img"
      src={logo.src}
      alt={logo.alt}
      sx={{
        display: 'block',
        height: 40,
        width: 'auto',
        objectFit: 'contain',
        ...sx,
      }}
      {...props}
    />
  );
};

export default Logo;
