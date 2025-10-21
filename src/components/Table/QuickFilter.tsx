import { ClickAwayListener, MenuItem, MenuList, Paper } from '@mui/material';
import { Box, Grow, Popper, Typography, styled, useTheme } from '@mui/material';
import { PropsWithChildren, ReactNode, useRef, useState } from 'react';

export interface SubmenuConfig<Filters> {
  filters: Partial<Filters>;
  key: string;
  label: ReactNode;
}

interface Props<Filters> {
  active: boolean;
  onClick: (additionalFilters?: Partial<Filters>) => void;
  submenuConfig?: SubmenuConfig<Filters>[];
}

const Container = styled(Box)(({ theme }) => ({
  borderBottom: '2px solid',
  color: theme.palette.text.primary,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  fontSize: 14,
  lineHeight: '22px',
  minWidth: theme.spacing(6),
  paddingBottom: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  marginBottom: -2,
}));

const Label = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '22px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const SubmenuItem = styled(MenuItem)({
  display: 'flex',
  gap: 8,
});

const QuickFilter = <Filters,>({ active, children, onClick, submenuConfig }: PropsWithChildren<Props<Filters>>) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorEl = useRef<HTMLDivElement>(null);

  const handleClick = (additionalFilters: Partial<Filters>) => {
    onClick(additionalFilters);
    handleClose();
  };

  function handleMouseOver() {
    if (open === false && !!submenuConfig) {
      setOpen(true);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Container
      sx={{ borderColor: active ? theme.palette.grey[800] : 'transparent' }}
      ref={anchorEl}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleClose}
    >
      <Label onClick={() => onClick()} color={active ? 'textPrimary' : 'textSecondary'}>
        {children}
      </Label>
      {submenuConfig && (
        <Popper
          anchorEl={anchorEl.current}
          open={open}
          style={{ zIndex: 100 }}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper
                sx={{
                  background: 'white',
                  borderRadius: 1.5,
                  boxShadow: theme.shadows[14],
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="composition-menu" aria-labelledby="composition-button">
                    {submenuConfig.map(({ filters, key, label }) => (
                      <SubmenuItem key={key} onClick={() => handleClick(filters)} disableRipple>
                        {label}
                      </SubmenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </Container>
  );
};

export default QuickFilter;
