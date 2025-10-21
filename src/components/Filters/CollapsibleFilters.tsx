import { ArrowUpward, Tune } from '@mui/icons-material';
import { Box, Button, Icon, Typography, styled } from '@mui/material';
import _noop from 'lodash/noop';
import React, { PropsWithChildren, createContext, useContext, useRef, useState } from 'react';
import { ActionBadge } from '../DataDisplay/ActionBadge';
import ClearFiltersButton from './ClearFiltersButton';

const CollapsibleFiltersContext = createContext<{
  isExpanded: boolean;
  setExpanded: (value: boolean) => void | undefined;
}>({
  isExpanded: false,
  setExpanded: _noop,
});

export interface CollapsibleFiltersProps extends PropsWithChildren {
  onClearFilters: () => void;
  isDirty?: boolean;
}

const FiltersBox = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  display: 'flex',
  flex: '1',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  rowGap: theme.spacing(1.5),
  transition: '250ms max-height, 250ms padding-top',
}));

const MoreFiltersButton: React.FC<{ counter: number }> = ({ counter }) => {
  const { isExpanded, setExpanded } = useContext(CollapsibleFiltersContext);
  return (
    <Button
      startIcon={
        isExpanded ? (
          <Icon component={ArrowUpward} />
        ) : (
          <>
            <Icon component={Tune} />
            {counter ? (
              <ActionBadge
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: 0,
                }}
              >
                <Typography>{counter}</Typography>
              </ActionBadge>
            ) : null}
          </>
        )
      }
      onClick={() => setExpanded(!isExpanded)}
    >
      {isExpanded ? 'Meno filtri' : 'Più filtri'}
    </Button>
  );
};

interface PrimaryFiltersProps<T extends object> extends PropsWithChildren {
  dirtyState: T;
  additionalFilters: (keyof T)[];
}

export const PrimaryFilters = <T extends object>(props: PrimaryFiltersProps<T>) => {
  const { children, dirtyState, additionalFilters } = props;
  const counter = additionalFilters.reduce((acc, key) => {
    if (key in dirtyState) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <Box display="flex" gap={1}>
      <FiltersBox pt={1}>
        {children}
        <MoreFiltersButton counter={counter} />
      </FiltersBox>
    </Box>
  );
};

export const AdditionalFilters: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { isExpanded } = useContext(CollapsibleFiltersContext);
  const filtersRef = useRef<HTMLDivElement>(null);

  return (
    <FiltersBox
      ref={filtersRef}
      pt={isExpanded ? 1 : 0}
      maxHeight={isExpanded ? (filtersRef.current?.scrollHeight ?? 0) + 8 : '0px'}
    >
      {children}
    </FiltersBox>
  );
};

const CollapsibleFilters: React.FC<CollapsibleFiltersProps> = (props) => {
  const { children, onClearFilters, isDirty } = props;
  const [isExpanded, setExpanded] = useState(false);

  return (
    <Box display="flex" gap={1} flexDirection="column" width="100%" px={3} mt={1}>
      <CollapsibleFiltersContext.Provider
        value={{
          isExpanded,
          setExpanded,
        }}
      >
        {children}
      </CollapsibleFiltersContext.Provider>
      {isDirty ? (
        <Box textAlign="left">
          <ClearFiltersButton onClick={onClearFilters} disabled={!isDirty} />
        </Box>
      ) : null}
    </Box>
  );
};

export default CollapsibleFilters;
