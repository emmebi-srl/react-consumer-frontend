import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import BackButton from './BackButton';

interface Props {
  /** Where the back navigation goes, usually `RouteConfig.<List>.buildLink()`. */
  backTo: string;
  /** Accessible label of the desktop back arrow. */
  backAriaLabel?: string;
  title: ReactNode;
  /** Status chips and similar small badges. */
  badges?: ReactNode;
  /** Page actions (buttons, menus). */
  actions?: ReactNode;
}

/**
 * Header of detail/create/edit pages reached from a list.
 * - Desktop: back arrow, title, badges on the left; actions on the right.
 * - Mobile: "Torna indietro" with the badges on its own first line, then the title (wraps, long names are fine),
 *   then the actions.
 */
const DetailPageHeader: React.FC<Props> = ({ backTo, backAriaLabel, title, badges, actions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 0.5 }}>
          <Button component={RouterLink} to={backTo} startIcon={<ArrowBack />} size="small" sx={{ ml: -1, mr: 'auto' }}>
            Torna indietro
          </Button>
          {badges ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>{badges}</Box> : null}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        {actions ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box> : null}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flexWrap: 'wrap' }}>
        <BackButton to={backTo} ariaLabel={backAriaLabel} />
        <Typography variant="h4" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        {badges}
      </Box>
      {actions ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box> : null}
    </Box>
  );
};

export default DetailPageHeader;
