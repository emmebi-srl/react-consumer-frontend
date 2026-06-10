import { ReactNode, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TimelineDateRange, TimelineTypeOption } from './HorizontalTimeline';

export interface TimelineSchedulerRenderItemParams<TItem, TType extends string> {
  color: string;
  date: Date;
  item: TItem;
  type: TType;
}

export interface TimelineSchedulerProps<TItem, TType extends string> {
  dateRange?: TimelineDateRange;
  emptyMessage?: string;
  filteredEmptyMessage?: string;
  getItemDate: (item: TItem) => Date;
  getItemIsOpen?: (item: TItem) => boolean;
  getItemKey: (item: TItem) => string | number;
  getItemSortLabel?: (item: TItem) => string;
  getItemType: (item: TItem) => TType;
  initialVisibleTypes?: TType[];
  items: TItem[];
  maxHeight?: number | string;
  renderItem: (params: TimelineSchedulerRenderItemParams<TItem, TType>) => ReactNode;
  showTypeFilters?: boolean;
  typeOptions: TimelineTypeOption<TType>[];
}

interface SchedulerItemNode<TItem, TType extends string> {
  color: string;
  date: Date;
  isOpen: boolean;
  item: TItem;
  sortLabel: string;
  type: TType;
}

const monthKeyFormat = 'yyyy-MM';

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const getMonthKey = (date: Date) => format(date, monthKeyFormat);

const TimelineScheduler = <TItem, TType extends string>({
  dateRange,
  emptyMessage = "Non ci sono elementi disponibili per l'intervallo selezionato.",
  filteredEmptyMessage = 'Nessun elemento corrisponde ai filtri attivi.',
  getItemDate,
  getItemIsOpen,
  getItemKey,
  getItemSortLabel,
  getItemType,
  initialVisibleTypes,
  items,
  maxHeight = 560,
  renderItem,
  showTypeFilters = true,
  typeOptions,
}: TimelineSchedulerProps<TItem, TType>) => {
  const [visibleTypes, setVisibleTypes] = useState<TType[]>(
    () => initialVisibleTypes ?? typeOptions.map(({ key }) => key),
  );
  const optionByType = useMemo(() => new Map(typeOptions.map((option) => [option.key, option])), [typeOptions]);

  const itemDates = useMemo(() => {
    return items.map(getItemDate).sort((left, right) => left.getTime() - right.getTime());
  }, [getItemDate, items]);

  const schedulerRange = useMemo(() => {
    const firstItemDate = itemDates[0] ?? new Date();
    const lastItemDate = itemDates[itemDates.length - 1] ?? firstItemDate;
    const start = startOfMonth(dateRange?.startDate ?? firstItemDate);
    const end = endOfMonth(dateRange?.endDate ?? lastItemDate);

    if (isAfter(start, end)) {
      return {
        end: endOfMonth(start),
        start,
      };
    }

    return { end, start };
  }, [dateRange?.endDate, dateRange?.startDate, itemDates]);

  const months = useMemo(() => {
    return eachMonthOfInterval({
      end: schedulerRange.end,
      start: schedulerRange.start,
    });
  }, [schedulerRange.end, schedulerRange.start]);

  const nodesByMonth = useMemo(() => {
    const groupedNodes = new Map<string, SchedulerItemNode<TItem, TType>[]>();

    months.forEach((month) => groupedNodes.set(getMonthKey(month), []));

    items.forEach((item) => {
      const type = getItemType(item);
      const option = optionByType.get(type);

      if (!option) {
        return;
      }

      const date = getItemDate(item);

      if (isBefore(date, startOfDay(schedulerRange.start)) || isAfter(date, endOfDay(schedulerRange.end))) {
        return;
      }

      if (!visibleTypes.includes(type)) {
        return;
      }

      const monthKey = getMonthKey(date);
      const monthNodes = groupedNodes.get(monthKey);

      if (!monthNodes) {
        return;
      }

      monthNodes.push({
        color: option.color,
        date,
        isOpen: getItemIsOpen?.(item) ?? true,
        item,
        sortLabel: getItemSortLabel?.(item) ?? '',
        type,
      });
    });

    groupedNodes.forEach((monthNodes) => {
      monthNodes.sort((left, right) => {
        const dateDiff = left.date.getTime() - right.date.getTime();
        if (dateDiff !== 0) {
          return dateDiff;
        }

        return left.sortLabel.localeCompare(right.sortLabel);
      });
    });

    return groupedNodes;
  }, [
    getItemDate,
    getItemIsOpen,
    getItemSortLabel,
    getItemType,
    items,
    months,
    optionByType,
    schedulerRange.end,
    schedulerRange.start,
    visibleTypes,
  ]);

  const countsByType = useMemo(() => {
    const counts = new Map<TType, number>();

    items.forEach((item) => {
      const type = getItemType(item);
      const option = optionByType.get(type);

      if (!option) {
        return;
      }

      const date = getItemDate(item);

      if (isBefore(date, startOfDay(schedulerRange.start)) || isAfter(date, endOfDay(schedulerRange.end))) {
        return;
      }

      counts.set(type, (counts.get(type) ?? 0) + 1);
    });

    return counts;
  }, [getItemDate, getItemType, items, optionByType, schedulerRange.end, schedulerRange.start]);

  const totalVisibleItems = useMemo(() => {
    return [...nodesByMonth.values()].reduce((acc, monthNodes) => acc + monthNodes.length, 0);
  }, [nodesByMonth]);

  const totalItemsInRange = useMemo(() => {
    return [...countsByType.values()].reduce((acc, count) => acc + count, 0);
  }, [countsByType]);

  const handleCheckboxChange = (type: TType) => (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setVisibleTypes((current) => {
      if (checked) {
        return current.includes(type) ? current : [...current, type];
      }

      const next = current.filter((item) => item !== type);
      return next.length > 0 ? next : current;
    });
  };

  const renderLegend = () => {
    if (!showTypeFilters) {
      return null;
    }

    return (
      <Stack
        direction={{ md: 'row', xs: 'column' }}
        spacing={{ md: 2, xs: 0.25 }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        {typeOptions.map((option) => {
          const Icon = option.icon;

          return (
            <FormControlLabel
              key={option.key}
              control={
                <Checkbox
                  checked={visibleTypes.includes(option.key)}
                  onChange={handleCheckboxChange(option.key)}
                  size="small"
                  sx={{
                    color: option.color,
                    '&.Mui-checked': {
                      color: option.color,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ alignItems: 'center', color: 'text.primary', display: 'inline-flex', gap: 0.75 }}>
                  <Icon sx={{ color: option.color, fontSize: 18 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }} variant="body2">
                    {option.label}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 12 }} variant="caption">
                    {countsByType.get(option.key) ?? 0}
                  </Typography>
                </Box>
              }
              sx={{ mr: 0 }}
            />
          );
        })}
      </Stack>
    );
  };

  if (items.length <= 0 || totalItemsInRange <= 0) {
    return (
      <>
        <Alert severity="info">{emptyMessage}</Alert>
        {renderLegend()}
      </>
    );
  }

  if (totalVisibleItems <= 0) {
    return (
      <>
        <Alert severity="info">{filteredEmptyMessage}</Alert>
        {renderLegend()}
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          maxHeight,
          overflow: 'auto',
          pb: 1,
          scrollbarWidth: 'thin',
        }}
      >
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            display: 'grid',
            gridAutoColumns: { md: '286px', sm: '270px', xs: 'minmax(230px, 82vw)' },
            gridAutoFlow: 'column',
            minHeight: 420,
            minWidth: `max(100%, ${months.length * 286}px)`,
          }}
        >
          {months.map((month, index) => {
            const monthKey = getMonthKey(month);
            const monthNodes = nodesByMonth.get(monthKey) ?? [];
            const columnBgcolor = index % 2 === 0 ? 'background.paper' : alpha('#ECEFF1', 0.42);

            return (
              <Box
                key={monthKey}
                sx={{
                  bgcolor: columnBgcolor,
                  borderRight: index === months.length - 1 ? 0 : 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 420,
                }}
              >
                <Box
                  sx={{
                    bgcolor: columnBgcolor,
                    borderBottom: 1,
                    borderColor: 'divider',
                    position: 'sticky',
                    px: 1.5,
                    py: 1.25,
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <Stack alignItems="baseline" direction="row" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }} variant="subtitle2">
                      {capitalize(format(month, 'MMMM yyyy', { locale: it }))}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }} variant="caption">
                      {monthNodes.length}
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={1} sx={{ flex: '1 1 auto', p: 1.25 }}>
                  {monthNodes.length > 0 ? (
                    monthNodes.map((node) => (
                      <Box
                        key={`${node.type}-${getItemKey(node.item)}`}
                        sx={{
                          bgcolor: node.isOpen ? alpha(node.color, 0.08) : alpha('#ECEFF1', 0.72),
                          border: 1,
                          borderColor: node.isOpen ? alpha(node.color, 0.28) : alpha('#607D8B', 0.45),
                          borderLeft: 4,
                          borderLeftColor: node.isOpen ? node.color : '#78909C',
                          borderStyle: node.isOpen ? 'solid' : 'dashed',
                          borderRadius: 1,
                          minHeight: 94,
                          opacity: node.isOpen ? 1 : 0.82,
                          overflow: 'hidden',
                          p: 1.25,
                        }}
                      >
                        <Typography
                          sx={{
                            color: node.isOpen ? node.color : 'text.secondary',
                            fontSize: 12,
                            fontWeight: 800,
                            mb: 0.75,
                          }}
                          variant="caption"
                        >
                          {capitalize(format(node.date, 'dd MMM', { locale: it }))}
                        </Typography>
                        {renderItem({
                          color: node.color,
                          date: node.date,
                          item: node.item,
                          type: node.type,
                        })}
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        alignItems: 'center',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        color: 'text.secondary',
                        display: 'flex',
                        flex: '1 1 auto',
                        justifyContent: 'center',
                        minHeight: 160,
                        px: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: 13 }} variant="body2">
                        Nessuna scadenza
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Box>
      {renderLegend()}
    </>
  );
};

export default TimelineScheduler;
