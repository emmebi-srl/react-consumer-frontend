import { Box, styled, Icon as MuiIcon, useTheme } from '@mui/material';
import { last, sortBy } from 'lodash';
import { ReactNode } from 'react';
import { ActionBadge } from '../DataDisplay/ActionBadge';
import QuickFilter, { SubmenuConfig } from './QuickFilter';

export interface QuickFilterConfig<Key extends string, Filters, Sorting = undefined> {
  key: Key;
  isActive: (filters: Filters) => boolean;
  label: string;
  Icon?: React.FC;
  filter: Partial<Filters>;
  notificationCount?: number;
  sorting?: Sorting;
  priority: number;
  submenu?: SubmenuConfig<Filters>[];
  submenuIcon?: (filters: Filters) => ReactNode;
}

interface Props<Key extends string, Filters, Sorting = undefined> {
  currentFilters: Filters;
  configs: QuickFilterConfig<Key, Filters, Sorting>[];
  onClick: (filters: Partial<Filters>, sorting: Sorting | undefined) => void;
}

const QuickFiltersContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing(5),
  backgroundColor: theme.palette.background.default,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  borderCollapse: 'collapse',
  borderBottom: '2px solid',
  borderColor: theme.palette.grey[100],
}));

const QuickFilters = <Key extends string, Filters, Sorting = undefined>({
  currentFilters,
  configs,
  onClick,
}: Props<Key, Filters, Sorting>) => {
  const { palette } = useTheme();
  const activeConfig = sortBy(configs, ['priority']).find((config) => config.isActive(currentFilters)) ?? last(configs);

  return (
    <QuickFiltersContainer>
      {configs.map(({ Icon, ...config }) => {
        const active = activeConfig?.key === config.key;
        return (
          <QuickFilter
            active={active}
            key={config.key}
            onClick={(additionalFilters) => onClick({ ...config.filter, ...additionalFilters }, config.sorting)}
            submenuConfig={config.submenu}
          >
            {active && config.submenuIcon?.(currentFilters)}
            {config.label}
            {!!config.notificationCount && <ActionBadge>{config.notificationCount}</ActionBadge>}
            {Icon && (
              <MuiIcon
                component={Icon}
                fontSize="small"
                sx={{ color: active ? palette.text.primary : palette.text.secondary }}
              />
            )}
          </QuickFilter>
        );
      })}
    </QuickFiltersContainer>
  );
};

export default QuickFilters;
