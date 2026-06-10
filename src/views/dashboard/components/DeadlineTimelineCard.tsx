import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import ViewTimelineRoundedIcon from '@mui/icons-material/ViewTimelineRounded';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import HorizontalTimeline, {
  TimelineRenderItemCardParams,
  TimelineScheduler,
  TimelineSchedulerRenderItemParams,
  TimelineTypeOption,
} from '~/components/Timeline';
import { RouteConfig } from '~/routes/routeConfig';
import { DashboardTimelineItem } from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';

type TimelineFilter = DashboardTimelineItem['type'];
type DeadlineTimelineView = 'horizontal' | 'scheduler';

interface Props {
  dateRange: DateRangeValue;
  isError: boolean;
  isLoading: boolean;
  items: DashboardTimelineItem[];
  onDateRangeChange: (dateRange: DateRangeValue) => void;
}

const timelineTypeOptions: TimelineTypeOption<TimelineFilter>[] = [
  {
    color: '#D14343',
    icon: AutorenewRoundedIcon,
    key: 'periodic-check',
    label: 'Controlli periodici',
  },
  {
    color: '#E0A100',
    icon: ConfirmationNumberOutlinedIcon,
    key: 'expiring-ticket',
    label: 'Ticket in scadenza',
  },
  {
    color: '#2563EB',
    icon: Inventory2OutlinedIcon,
    key: 'expiring-material',
    label: 'Materiali in scadenza',
  },
  {
    color: '#00897B',
    icon: SimCardOutlinedIcon,
    key: 'expiring-system-sim',
    label: 'SIM impianto in scadenza',
  },
];

const urgencySxByLevel = {
  0: { bgcolor: alpha('#0288D1', 0.12), color: 'info.dark' },
  1: { bgcolor: alpha('#ED6C02', 0.14), color: 'warning.dark' },
  2: { bgcolor: alpha('#D32F2F', 0.12), color: 'error.dark' },
} as const;

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const renderDeadlineItemSummary = (item: DashboardTimelineItem) => {
  const customerLink = item.customerId
    ? RouteConfig.CustomerDetail.buildLink({ customerId: String(item.customerId) })
    : undefined;

  return (
    <>
      <Typography
        sx={{
          color: item.isOpen ? 'text.primary' : 'text.secondary',
          display: '-webkit-box',
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.25,
          overflow: 'hidden',
          textDecoration: item.isOpen ? 'none' : 'line-through',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        }}
        variant="body1"
      >
        {item.title}
      </Typography>

      {item.customerName ? (
        customerLink ? (
          <Link
            color="text.primary"
            component={RouterLink}
            sx={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              mt: 0.5,
              opacity: item.isOpen ? 1 : 0.75,
              textDecorationColor: alpha('#000000', 0.25),
            }}
            to={customerLink}
            underline="hover"
          >
            {item.customerName}
          </Link>
        ) : (
          <Typography
            noWrap
            sx={{ fontSize: 13, fontWeight: 600, mt: 0.5, opacity: item.isOpen ? 1 : 0.75 }}
            variant="body2"
          >
            {item.customerName}
          </Typography>
        )
      ) : null}

      {item.systemDescription ? (
        <Typography
          noWrap
          color="text.secondary"
          sx={{ display: 'block', mt: 0.35, opacity: item.isOpen ? 1 : 0.72 }}
          variant="caption"
        >
          {item.systemDescription}
        </Typography>
      ) : null}

      {item.subtitle ? (
        <Typography
          sx={{
            color: 'text.secondary',
            display: '-webkit-box',
            fontSize: 12,
            lineHeight: 1.35,
            mt: 0.75,
            opacity: item.isOpen ? 1 : 0.72,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          }}
        >
          {item.subtitle}
        </Typography>
      ) : null}
    </>
  );
};

const renderDeadlineTimelineCardContent = ({
  date,
  item,
}: TimelineRenderItemCardParams<DashboardTimelineItem, TimelineFilter>) => {
  const urgencyLevel = item.urgency === 1 || item.urgency === 2 ? item.urgency : 0;
  const urgencySx = urgencySxByLevel[urgencyLevel];

  return (
    <>
      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }} variant="caption">
          {capitalize(format(date, 'dd MMM yyyy', { locale: it }))}
        </Typography>
        {item.urgencyLabel ? (
          <Box
            sx={{
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              px: 0.9,
              py: 0.35,
              ...urgencySx,
            }}
          >
            {item.urgencyLabel}
          </Box>
        ) : null}
      </Stack>

      {renderDeadlineItemSummary(item)}
    </>
  );
};

const renderDeadlineSchedulerItemContent = ({
  item,
}: TimelineSchedulerRenderItemParams<DashboardTimelineItem, TimelineFilter>) => {
  return <>{renderDeadlineItemSummary(item)}</>;
};

const DeadlineTimelineCard: React.FC<Props> = ({ dateRange, isError, isLoading, items, onDateRangeChange }) => {
  const [timelineView, setTimelineView] = useState<DeadlineTimelineView>('horizontal');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const filteredItems = useMemo(() => {
    if (!showOnlyPending) {
      return items;
    }

    return items.filter((item) => item.isOpen);
  }, [items, showOnlyPending]);

  const handleTimelineViewChange = (_event: React.MouseEvent<HTMLElement>, nextView: DeadlineTimelineView | null) => {
    if (nextView) {
      setTimelineView(nextView);
    }
  };

  const emptyMessage = showOnlyPending
    ? "Non ci sono scadenze pendenti disponibili per l'intervallo selezionato."
    : "Non ci sono scadenze disponibili per l'intervallo selezionato.";

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { md: 3, xs: 2 } }}>
        <Box
          sx={{
            alignItems: { md: 'flex-start', xs: 'stretch' },
            display: 'flex',
            flexDirection: { md: 'row', xs: 'column' },
            gap: 2,
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Typography gutterBottom variant="h5">
              Timeline Scadenze
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Timeline orizzontale unica con tutte le scadenze del periodo, compresi ticket, controlli periodici e
              materiali e SIM impianto in scadenza. Il marker di oggi viene evidenziato e la vista si posiziona
              automaticamente su di lui.
            </Typography>
          </Box>

          <Stack alignItems={{ md: 'flex-end', xs: 'stretch' }} spacing={1.25}>
            <Stack
              alignItems={{ md: 'center', xs: 'stretch' }}
              direction={{ md: 'row', xs: 'column' }}
              justifyContent="flex-end"
              spacing={1.25}
              sx={{
                width: { md: 'auto', xs: '100%' },
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyPending}
                    inputProps={{ 'aria-label': 'Mostra solo scadenze pendenti' }}
                    onChange={(_event, checked) => setShowOnlyPending(checked)}
                    size="small"
                  />
                }
                label="Solo pendenti"
                sx={{
                  alignSelf: { md: 'center', xs: 'flex-start' },
                  mr: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  },
                }}
              />
              <DateRangePicker
                allowFuture
                dataTestId="dashboard-deadline-timeline-date-range"
                onChange={onDateRangeChange}
                value={dateRange}
              />
            </Stack>
            <ToggleButtonGroup
              exclusive
              onChange={handleTimelineViewChange}
              size="small"
              sx={{
                alignSelf: { md: 'flex-end', xs: 'stretch' },
                '& .MuiToggleButton-root': {
                  px: 1.25,
                },
              }}
              value={timelineView}
            >
              <Tooltip title="Timeline orizzontale">
                <ToggleButton aria-label="Timeline orizzontale" value="horizontal">
                  <ViewTimelineRoundedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Scheduler mensile">
                <ToggleButton aria-label="Scheduler mensile" value="scheduler">
                  <CalendarMonthRoundedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {isLoading ? (
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: 360 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && isError ? (
          <Alert severity="error">Non sono riuscito a caricare la timeline delle scadenze.</Alert>
        ) : null}

        {!isLoading && !isError && timelineView === 'horizontal' ? (
          <HorizontalTimeline
            dateRange={dateRange}
            emptyMessage={emptyMessage}
            filteredEmptyMessage="Nessuna scadenza corrisponde ai filtri attivi."
            getItemDate={(item) => getDateByUnixtimestamp({ unixTimestamp: item.dueDate })}
            getItemIsOpen={(item) => item.isOpen}
            getItemKey={(item) => `${item.type}-${item.id}-${item.dueDate}-${item.title}`}
            getItemPosition={(item) => (item.isOpen ? 'top' : 'bottom')}
            getItemSortLabel={(item) => item.title}
            getItemType={(item) => item.type}
            initialVisibleTypes={['periodic-check', 'expiring-ticket', 'expiring-material', 'expiring-system-sim']}
            items={filteredItems}
            renderItemCard={renderDeadlineTimelineCardContent}
            typeOptions={timelineTypeOptions}
          />
        ) : null}

        {!isLoading && !isError && timelineView === 'scheduler' ? (
          <TimelineScheduler
            dateRange={dateRange}
            emptyMessage={emptyMessage}
            filteredEmptyMessage="Nessuna scadenza corrisponde ai filtri attivi."
            getItemDate={(item) => getDateByUnixtimestamp({ unixTimestamp: item.dueDate })}
            getItemIsOpen={(item) => item.isOpen}
            getItemKey={(item) => `${item.type}-${item.id}-${item.dueDate}-${item.title}`}
            getItemSortLabel={(item) => item.title}
            getItemType={(item) => item.type}
            items={filteredItems}
            renderItem={renderDeadlineSchedulerItemContent}
            typeOptions={timelineTypeOptions}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DeadlineTimelineCard;
