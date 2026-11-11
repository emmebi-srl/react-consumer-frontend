import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  /** Before the title, e.g. a back button. */
  leading?: ReactNode;
  /** Right after the title (e.g. "Aggiorna"). */
  actions?: ReactNode;
  /** Pushed to the right on desktop (e.g. the primary "Nuovo …" button). */
  endActions?: ReactNode;
}

/**
 * Title bar of a list page. On small screens it wraps instead of overflowing: title on the first line,
 * buttons below, smaller title font. Use it instead of a hand-made `Stack direction="row"`.
 */
const ListPageHeader: React.FC<Props> = ({ title, leading, actions, endActions }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      {leading}
      <Typography
        variant="h4"
        sx={(theme) => ({ [theme.breakpoints.down('sm')]: { fontSize: theme.typography.h5.fontSize } })}
      >
        {title}
      </Typography>
    </Box>
    {actions ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box> : null}
    {endActions ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: { sm: 'auto' } }}>{endActions}</Box> : null}
  </Box>
);

export default ListPageHeader;
