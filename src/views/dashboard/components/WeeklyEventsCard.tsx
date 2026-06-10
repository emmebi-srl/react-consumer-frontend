import { useMemo, useState } from 'react';
import {
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  getUnixTime,
  isSameDay,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { it } from 'date-fns/locale';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { Alert, Box, Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEventsBetweenDates } from '~/proxies/aries-proxy/events';
import { Event as AriesEvent } from '~/types/aries-proxy/events';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';

interface WeeklyEventDay {
  date: Date;
  events: AriesEvent[];
}

const eventColors = ['#2563EB', '#00897B', '#D14343', '#7E57C2', '#E0A100', '#546E7A'];

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const getEventColor = (event: AriesEvent) => eventColors[Math.abs(event.eventTypeId) % eventColors.length] ?? '#2563EB';

const formatEventTime = (seconds: number) => {
  const normalizedSeconds = Math.max(0, seconds);
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatEventTimeRange = (event: AriesEvent) => {
  if (!event.executionStartTime && !event.executionEndTime) {
    return '';
  }

  const startTime = formatEventTime(event.executionStartTime);
  const endTime = event.executionEndTime > event.executionStartTime ? formatEventTime(event.executionEndTime) : '';

  return endTime ? `${startTime} - ${endTime}` : startTime;
};

const getEventSortTime = (event: AriesEvent) => {
  return getDateByUnixtimestamp({ unixTimestamp: event.executionDate }).getTime() + event.executionStartTime * 1000;
};

const WeeklyEventsCard = () => {
  const [selectedWeek, setSelectedWeek] = useState(() => startOfWeek(new Date(), { locale: it, weekStartsOn: 1 }));

  const weekRange = useMemo(() => {
    const startDate = startOfDay(startOfWeek(selectedWeek, { locale: it, weekStartsOn: 1 }));
    const endDate = endOfDay(endOfWeek(selectedWeek, { locale: it, weekStartsOn: 1 }));

    return { endDate, startDate };
  }, [selectedWeek]);

  const eventsQuery = useEventsBetweenDates({
    fromDate: getUnixTime(weekRange.startDate),
    toDate: getUnixTime(weekRange.endDate),
  });

  const weekDays = useMemo<WeeklyEventDay[]>(() => {
    const visibleEvents = (eventsQuery.data ?? [])
      .filter((event) => !event.isRemoved)
      .sort((left, right) => {
        const dateDiff = getEventSortTime(left) - getEventSortTime(right);

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return left.subject.localeCompare(right.subject);
      });

    return eachDayOfInterval({ end: weekRange.endDate, start: weekRange.startDate }).map((date) => ({
      date,
      events: visibleEvents.filter((event) =>
        isSameDay(getDateByUnixtimestamp({ unixTimestamp: event.executionDate }), date),
      ),
    }));
  }, [eventsQuery.data, weekRange.endDate, weekRange.startDate]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { md: 3, xs: 2 } }}>
        <Box
          sx={{
            alignItems: { md: 'center', xs: 'stretch' },
            display: 'flex',
            flexDirection: { md: 'row', xs: 'column' },
            gap: 2,
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <EventNoteRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h5">Calendario settimanale</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 700, mt: 0.5 }} variant="body2">
              {capitalize(format(weekRange.startDate, 'd MMM', { locale: it }))} -{' '}
              {capitalize(format(weekRange.endDate, 'd MMM yyyy', { locale: it }))}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} sx={{ alignSelf: { md: 'center', xs: 'flex-end' } }}>
            <Tooltip title="Settimana precedente">
              <IconButton
                aria-label="Settimana precedente"
                onClick={() => setSelectedWeek((date) => subWeeks(date, 1))}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settimana corrente">
              <IconButton
                aria-label="Settimana corrente"
                onClick={() => setSelectedWeek(startOfWeek(new Date(), { locale: it, weekStartsOn: 1 }))}
              >
                <TodayRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settimana successiva">
              <IconButton
                aria-label="Settimana successiva"
                onClick={() => setSelectedWeek((date) => addWeeks(date, 1))}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {eventsQuery.isLoading ? (
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!eventsQuery.isLoading && eventsQuery.isError ? (
          <Alert severity="error">Non sono riuscito a caricare gli eventi del calendario.</Alert>
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError ? (
          <Box sx={{ overflowX: { md: 'auto', xs: 'visible' }, pb: { md: 0.5, xs: 0 } }}>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: { md: 'repeat(7, minmax(136px, 1fr))', xs: '1fr' },
                minWidth: { md: 980, xs: 0 },
              }}
            >
              {weekDays.map((day) => {
                const isToday = isSameDay(day.date, new Date());

                return (
                  <Box
                    key={format(day.date, 'yyyy-MM-dd')}
                    sx={{
                      bgcolor: isToday ? alpha('#2563EB', 0.06) : 'background.paper',
                      border: 1,
                      borderColor: isToday ? alpha('#2563EB', 0.28) : 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      minHeight: { md: 280, xs: 68 },
                      p: 1,
                    }}
                  >
                    <Box
                      sx={{
                        borderBottom: { md: 1, xs: 0 },
                        borderColor: 'divider',
                        minWidth: 0,
                        pb: { md: 1, xs: 0 },
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontSize: 11, fontWeight: 800 }} variant="caption">
                        {format(day.date, 'EEE', { locale: it }).toUpperCase()}
                      </Typography>
                      <Stack alignItems="baseline" direction="row" spacing={0.75}>
                        <Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }} variant="h6">
                          {format(day.date, 'd')}
                        </Typography>
                        {isToday ? (
                          <Typography color="primary" sx={{ fontSize: 11, fontWeight: 800 }} variant="caption">
                            Oggi
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>

                    <Stack spacing={0.75} sx={{ flex: '1 1 auto', minWidth: 0 }}>
                      {day.events.length > 0 ? (
                        day.events.map((event) => {
                          const color = getEventColor(event);
                          const timeRange = formatEventTimeRange(event);

                          return (
                            <Box
                              key={`${event.id}-${event.executionDate}-${event.executionStartTime}`}
                              sx={{
                                bgcolor: event.wasPerformed ? alpha('#ECEFF1', 0.78) : alpha(color, 0.12),
                                border: 1,
                                borderColor: event.wasPerformed ? alpha('#607D8B', 0.38) : alpha(color, 0.34),
                                borderLeft: 4,
                                borderLeftColor: event.wasPerformed ? '#78909C' : color,
                                borderRadius: 1,
                                minHeight: 44,
                                opacity: event.wasPerformed ? 0.78 : 1,
                                px: 1.25,
                                py: 0.85,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: event.wasPerformed ? 'text.secondary' : 'text.primary',
                                  display: '-webkit-box',
                                  fontSize: 13,
                                  fontWeight: 800,
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textDecoration: event.wasPerformed ? 'line-through' : 'none',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                }}
                                variant="body2"
                              >
                                {event.subject}
                              </Typography>
                              {timeRange || event.description ? (
                                <Typography
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    fontSize: 12,
                                    lineHeight: 1.25,
                                    mt: 0.35,
                                    overflow: 'hidden',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 1,
                                  }}
                                  variant="caption"
                                >
                                  {[timeRange, event.description].filter(Boolean).join(' - ')}
                                </Typography>
                              ) : null}
                            </Box>
                          );
                        })
                      ) : (
                        <Box
                          sx={{
                            alignItems: 'center',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            color: 'text.secondary',
                            display: 'flex',
                            flex: { md: '1 1 auto', xs: '0 0 auto' },
                            minHeight: 44,
                            px: 1.25,
                          }}
                        >
                          <Typography sx={{ fontSize: 13 }} variant="body2">
                            Nessun evento
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default WeeklyEventsCard;
