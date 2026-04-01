import { Box, BoxProps, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Logo from '~/components/Layout/Logo';
import { CompanyInfo } from '~/types/aries-proxy/landing';

interface LandingFooterProps extends BoxProps {
  companyInfo?: CompanyInfo | null;
  hideLogo?: boolean;
}

const joinParts = (parts: (string | null | undefined)[], separator = ' ') => parts.filter(Boolean).join(separator);

const formatAddress = (companyInfo: CompanyInfo) => {
  const street = joinParts([companyInfo.address, companyInfo.number]);
  const city = joinParts([
    companyInfo.postalCode,
    companyInfo.municipality,
    companyInfo.province && `(${companyInfo.province})`,
  ]);

  return [street, city].filter(Boolean);
};

const formatRegistryLine = (companyInfo: CompanyInfo) =>
  [
    companyInfo.vatNumber && `P.IVA ${companyInfo.vatNumber}`,
    companyInfo.fiscalCode && `C.F. ${companyInfo.fiscalCode}`,
    companyInfo.reaNumber && `REA ${companyInfo.reaNumber}`,
  ]
    .filter(Boolean)
    .join('  |  ');

const formatExtraLine = (companyInfo: CompanyInfo) =>
  [
    companyInfo.shareCapital && `Cap. Soc. ${companyInfo.shareCapital}`,
    companyInfo.bankName,
    companyInfo.iban && `IBAN ${companyInfo.iban}`,
  ]
    .filter(Boolean)
    .join('  |  ');

const LandingFooter: React.FC<LandingFooterProps> = ({ companyInfo, hideLogo, sx, ...props }) => {
  if (!companyInfo?.businessName) {
    return null;
  }

  const addressLines = formatAddress(companyInfo);
  const registryLine = formatRegistryLine(companyInfo);
  const extraLine = formatExtraLine(companyInfo);
  const contactLine = [companyInfo.phoneNumber, companyInfo.email, companyInfo.website].filter(Boolean).join('  |  ');

  return (
    <Box
      sx={{
        mt: 3,
        px: { xs: 0.5, md: 1 },
        pt: 3,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        ...sx,
      }}
      {...props}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          {!hideLogo && <Logo sx={{ height: 48 }} />}
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {companyInfo.businessName}
            </Typography>
            {addressLines.map((line) => (
              <Typography key={line} variant="body2" color="text.secondary">
                {line}
              </Typography>
            ))}
          </Box>
        </Stack>

        <Box sx={{ maxWidth: 620 }}>
          {contactLine ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {contactLine}
            </Typography>
          ) : null}
          {registryLine ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {registryLine}
            </Typography>
          ) : null}
          {extraLine ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {extraLine}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

export default LandingFooter;
