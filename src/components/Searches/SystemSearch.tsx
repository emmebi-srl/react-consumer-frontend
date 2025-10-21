import React from 'react';
import _isNumber from 'lodash/isNumber';
import { SxProps, Typography } from '@mui/material';
import { System } from '~/types/aries-proxy/systems';
import AutocompleteQuery from '../AutocompleteQuery/AutocompleteQuery';
import { useSystemsSearch } from '~/proxies/aries-proxy/systems';

const useAutocompleSearch = (searchTerm: string) => {
  const { data, isLoading } = useSystemsSearch(searchTerm);
  return { data: data?.systems, isLoading };
};

const SystemSearch: React.FC<{
  onSelect: (system: System | null) => void;
  systemId?: number | null;
  sx?: SxProps;
}> = ({ onSelect, systemId, sx }) => {
  return (
    <AutocompleteQuery<number, System>
      label="Impianto"
      getOptionLabel={(system) =>
        _isNumber(system) ? 'Caricamento impianto ...' : `${system.companyName} - ${system.description}`
      }
      value={systemId}
      sx={sx}
      onSelect={onSelect}
      queryFunc={useAutocompleSearch}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', listStyle: 'none' }}
        >
          <Typography variant="body1">{option.companyName}</Typography>
          <Typography variant="body2" color="textSecondary">
            {option.description}
            {option.id} -{' '}
            {option.destination
              ? `${option.destination.municipality} (${option.destination.province}) - ${option.destination.street}`
              : ''}
          </Typography>
          {option.destination ? (
            <Typography variant="body2" color="textSecondary">
              {option.destination.municipality} ({option.destination.province}) - {option.destination.street}
            </Typography>
          ) : null}
        </li>
      )}
      isOptionEqualToValue={(option, value) => option.id === value}
    />
  );
};

export default SystemSearch;
