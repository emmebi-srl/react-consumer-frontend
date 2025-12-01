import { Box, Button, styled, useTheme } from '@mui/material';
import _first from 'lodash/first';
import _sortBy from 'lodash/sortBy';
import _isObject from 'lodash/isObject';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import useRouteMatch from '~/hooks/useRouteMatch';

interface PathTabData {
  label: string;
  path: string;
  icon?: ReactNode | null;
  matchPriority?: number;
}

export interface StateTabData {
  label: string;
  key: string;
  icon?: ReactNode | null;
  matchPriority?: number;
}

export type TabData = PathTabData | StateTabData;

interface PathNavigationTabsProps {
  tabs: PathTabData[];
}

interface StateNavigationTabsProps {
  tabs: StateTabData[];
  selectedTabKey: string;
  onSelect: (tab: StateTabData) => void;
}

const Container = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 16,
  marginBottom: 16,
});

const Label = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  height: 42,
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '20px',
  paddingLeft: 24,
  paddingRight: 24,
});

const PathNavigationTabs: React.FC<PathNavigationTabsProps> = (props) => {
  const sortedTabs = _sortBy(props.tabs, (a) => -(a.matchPriority ?? 0));

  const firstTab = _first(sortedTabs);
  const theme = useTheme();

  const currentTab = useRouteMatch(sortedTabs.map((tab) => tab.path)) || firstTab?.path;
  const moreThanOneTab = sortedTabs.length > 1;
  return (
    <Container>
      {sortedTabs.map((tabData) => {
        const { label, path, icon } = tabData;
        const active = path === currentTab;
        return (
          <Link key={label} to={path} style={{ textDecoration: 'none' }}>
            <Label
              sx={{
                backgroundColor: active && moreThanOneTab ? theme.palette.primary.dark : 'transparent',
                color: active && moreThanOneTab ? 'white' : theme.palette.primary.dark,
              }}
            >
              {label} {icon}
            </Label>
          </Link>
        );
      })}
    </Container>
  );
};

const StateNavigationTabs: React.FC<StateNavigationTabsProps> = (props) => {
  const sortedTabs = _sortBy(props.tabs, (a) => -(a.matchPriority ?? 0));

  const firstTab = _first(sortedTabs);
  const theme = useTheme();

  const currentTab = sortedTabs.find((el) => el.key === props.selectedTabKey)?.key || firstTab?.key;
  const moreThanOneTab = sortedTabs.length > 1;
  return (
    <Container>
      {sortedTabs.map((tabData) => {
        const { label, key, icon } = tabData;
        const active = key === currentTab;
        return (
          <Button key={label} onClick={() => props.onSelect(tabData)} style={{ textDecoration: 'none' }}>
            <Label
              sx={{
                backgroundColor: active && moreThanOneTab ? theme.palette.primary.dark : 'transparent',
                color: active && moreThanOneTab ? 'white' : theme.palette.primary.dark,
              }}
            >
              {label} {icon}
            </Label>
          </Button>
        );
      })}
    </Container>
  );
};

const NavigationTabs: React.FC<PathNavigationTabsProps | StateNavigationTabsProps> = (props) => {
  if ('selectedTabKey' in props) {
    return <StateNavigationTabs {...props} />;
  }

  return <PathNavigationTabs {...props} />;
};

export default NavigationTabs;
