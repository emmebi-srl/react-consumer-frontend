import { Box, styled } from '@mui/material';
import { ReactNode } from 'react';
import NavigationTabs, { StateTabData } from './NavigationTabs';

export const ALL_TAB_KEY = 'all';
/** "Aperti" tab: the list sends the open statuses as `statusIds` (e.g. `QUOTE_OPEN_STATUS_IDS`). */
export const OPEN_TAB_KEY = 'open';

const Container = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  // Mobile: no side padding, buttons wrap below the tabs.
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

interface Props {
  tabs: StateTabData[];
  selectedTabKey: string;
  onSelect: (tab: StateTabData) => void;
  /** Page actions on the right ("Nuovo …", "Aggiorna", ...). */
  actions?: ReactNode;
}

/**
 * Top bar of a list page: quick-filter tabs on the left, page actions on the right.
 * It replaces the page title (the sidebar / mobile header already name the section).
 */
const ListTabs: React.FC<Props> = ({ tabs, selectedTabKey, onSelect, actions }) => (
  <Container>
    <NavigationTabs tabs={tabs} selectedTabKey={selectedTabKey} onSelect={onSelect} />
    {actions ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>{actions}</Box> : null}
  </Container>
);

export default ListTabs;
