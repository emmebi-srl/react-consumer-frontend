import React, { useCallback, useEffect, useState } from 'react';
import _isNil from 'lodash/isNil';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import { renderToString } from 'react-dom/server';
import { getMomentByUnixtimestamp } from '../../../../utils/datetime-utils';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import Map from '~/components/Maps/Map';
import { Work, WorkTypeEnum } from '~/types/aries-proxy/works';
import { createMapHandler } from '~/components/Maps/MapHandler';
import { assertIsDefined } from '~/types/typeGuards';
import { getMonthName } from '~/utils/months-utils';
import { getMonth } from 'date-fns';
import { formatLocaleNumber } from '~/utils/number-utils';

const START_LAT = 45.464664;
const START_LNG = 11.18854;
const START_ZOOM = 7;
const SEARCH_ZOOM = 13;

const TooltipPrimaryText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography
      style={{
        fontWeight: 600,
        color: theme.palette.primary.main,
        fontSize: theme.typography.body1.fontSize,
        margin: 0,
      }}
    >
      {children}
    </Typography>
  );
};

const TooltipSecondaryText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography
      style={{
        color: theme.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
        margin: 0,
      }}
    >
      {children}
    </Typography>
  );
};

const TooltipDetailsText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography
      style={{
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2.fontSize,
        margin: 0,
      }}
      sx={{
        '& span': { fontWeight: 600 },
      }}
    >
      {children}
    </Typography>
  );
};

const SearchMap: React.FC<{
  data?: Work[];
  isLoading?: boolean;
}> = ({ data, isLoading = false }) => {
  const [mapHandler, setMapHandler] = useState<ReturnType<typeof createMapHandler>>();

  const bindMapHandler = (mapHandler: ReturnType<typeof createMapHandler>) => {
    window.mapHandler = mapHandler;
    setMapHandler(mapHandler);
  };

  const refreshMapMarkers = useCallback(
    (results: Work[]) => {
      const formattedResults = results.map((result) => {
        return {
          ...result,
          items: {
            maintenance: result.items.find((el) => el.workType === WorkTypeEnum.Maintenance),
            tickets: result.items.filter((el) => el.workType === WorkTypeEnum.Ticket),
          },
        };
      });

      const firstElement = formattedResults[0];

      assertIsDefined(mapHandler, 'mapHandler is not defined');
      assertIsDefined(firstElement?.destination, 'firstElement.destination is not defined');

      mapHandler.centerMap(
        firstElement.destination.latitude ?? START_LAT,
        firstElement.destination.longitude ?? START_LNG,
        SEARCH_ZOOM,
      );

      mapHandler.refreshMarkers(
        formattedResults.map((result) => {
          const { maintenance, tickets = [] } = result.items;
          const maintenanceDate = maintenance?.expirationDate
            ? getMomentByUnixtimestamp({ unixTimestamp: maintenance.expirationDate })
            : null;

          const popup = renderToString(
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TooltipPrimaryText>
                {result.customerId} - {result.companyName}
              </TooltipPrimaryText>
              <TooltipSecondaryText>
                {result.systemId} - {result.systemType} - {result.systemDescription}
              </TooltipSecondaryText>
              <TooltipSecondaryText>
                {result.destination.municipality} ({result.destination.province}) - {result.destination.postalCode} -{' '}
                {result.destination.street} {result.destination.houseNumber}
              </TooltipSecondaryText>
              <TooltipDetailsText>
                Distanza:{' '}
                <span style={{ fontWeight: 600 }}>{formatLocaleNumber({ value: result.distance, radix: 2 })} km</span>
              </TooltipDetailsText>
              {maintenance ? (
                <TooltipDetailsText>
                  Controllo Periodico{' '}
                  {maintenanceDate ? (
                    <>
                      <span style={{ fontWeight: 600 }}> {getMonthName(getMonth(maintenanceDate.toDate()))}</span>
                    </>
                  ) : null}
                </TooltipDetailsText>
              ) : null}
              {tickets[0] ? (
                <TooltipDetailsText>
                  Ticket:
                  <span style={{ fontWeight: 600 }}> {tickets.length}</span>
                </TooltipDetailsText>
              ) : null}
            </div>,
          );

          return {
            lat: result.destination.latitude ?? START_LAT,
            lng: result.destination.longitude ?? START_LNG,
            popup,
          };
        }),
      );
    },
    [mapHandler],
  );

  useEffect(() => {
    if (!mapHandler) return;

    if (_isNil(data) || _isEmpty(data)) {
      mapHandler.centerMap(START_LAT, START_LNG, START_ZOOM);
    } else {
      refreshMapMarkers(data);
    }
  }, [data, mapHandler, refreshMapMarkers]);

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" gutterBottom>
        Lista risultati
      </Typography>
      <Box position="relative">
        <Map
          height={700}
          startLat={START_LAT}
          zoomLevel={START_ZOOM}
          startLng={START_LNG}
          bindMapHandler={bindMapHandler}
        />
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            zIndex={4000}
            height={700}
            sx={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default SearchMap;
