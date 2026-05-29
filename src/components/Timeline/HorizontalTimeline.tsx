import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import { Alert, Box, Checkbox, FormControlLabel, Stack, SvgIconTypeMap, Typography } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { alpha } from '@mui/material/styles';

export interface TimelineDateRange {
  endDate?: Date | null;
  startDate?: Date | null;
}

export interface TimelineTypeOption<TType extends string> {
  color: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  key: TType;
  label: string;
}

export interface TimelineRenderItemCardParams<TItem, TType extends string> {
  color: string;
  date: Date;
  item: TItem;
  position: 'bottom' | 'top';
  type: TType;
}

export interface TimelineLayoutOptions {
  cardHeight?: number;
  cardWidth?: number;
  columnWidth?: number;
  dotSize?: number;
  itemHeight?: number;
  lineTop?: number;
}

export interface HorizontalTimelineProps<TItem, TType extends string> {
  dateRange?: TimelineDateRange;
  emptyMessage?: string;
  filteredEmptyMessage?: string;
  getItemDate: (item: TItem) => Date;
  getItemKey: (item: TItem) => string | number;
  getItemSortLabel?: (item: TItem) => string;
  getItemType: (item: TItem) => TType;
  initialVisibleTypes?: TType[];
  items: TItem[];
  layout?: TimelineLayoutOptions;
  renderItemCard: (params: TimelineRenderItemCardParams<TItem, TType>) => ReactNode;
  showTodayMarker?: boolean;
  showTypeFilters?: boolean;
  typeOptions: TimelineTypeOption<TType>[];
}

type TimelineNode<TItem, TType extends string> =
  | {
      date: Date;
      item: TItem;
      kind: 'item';
      option: TimelineTypeOption<TType>;
      sortLabel: string;
      sortTime: number;
    }
  | {
      kind: 'today';
      sortTime: number;
    };

const defaultCardHeight = 154;
const defaultCardWidth = 210;
const defaultColumnWidth = 250;
const defaultDotSize = 22;
const defaultItemHeight = 480;
const defaultLineTop = 240;

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const defaultFormatDay = (date: Date) => capitalize(format(date, 'dd MMM', { locale: it }));
const HorizontalTimeline = <TItem, TType extends string>({
  dateRange,
  emptyMessage = "Non ci sono elementi disponibili per l'intervallo selezionato.",
  filteredEmptyMessage = 'Nessun elemento corrisponde ai filtri attivi.',
  getItemDate,
  getItemKey,
  getItemSortLabel,
  getItemType,
  initialVisibleTypes,
  items,
  layout,
  renderItemCard,
  showTodayMarker = true,
  showTypeFilters = true,
  typeOptions,
}: HorizontalTimelineProps<TItem, TType>) => {
  const [visibleTypes, setVisibleTypes] = useState<TType[]>(
    () => initialVisibleTypes ?? typeOptions.map(({ key }) => key),
  );
  const todayMarkerRef = useRef<HTMLDivElement | null>(null);

  const cardHeight = layout?.cardHeight ?? defaultCardHeight;
  const cardWidth = layout?.cardWidth ?? defaultCardWidth;
  const columnWidth = layout?.columnWidth ?? defaultColumnWidth;
  const dotSize = layout?.dotSize ?? defaultDotSize;
  const itemHeight = layout?.itemHeight ?? defaultItemHeight;
  const lineTop = layout?.lineTop ?? defaultLineTop;

  const dotHalf = dotSize / 2;
  const topConnectorTop = cardHeight;
  const topConnectorHeight = lineTop - dotHalf - topConnectorTop;
  const bottomCardTop = itemHeight - cardHeight;
  const bottomConnectorTop = lineTop + dotHalf;
  const bottomConnectorHeight = bottomCardTop - bottomConnectorTop;

  const optionByType = useMemo(() => new Map(typeOptions.map((option) => [option.key, option])), [typeOptions]);

  const countsByType = useMemo(() => {
    const counts = new Map<TType, number>();

    items.forEach((item) => {
      const type = getItemType(item);
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });

    return counts;
  }, [getItemType, items]);

  const filteredNodes = useMemo(() => {
    return items
      .reduce<TimelineNode<TItem, TType>[]>((acc, item) => {
        const type = getItemType(item);
        const option = optionByType.get(type);

        if (!option || !visibleTypes.includes(type)) {
          return acc;
        }

        const date = getItemDate(item);

        acc.push({
          date,
          item,
          kind: 'item',
          option,
          sortLabel: getItemSortLabel?.(item) ?? '',
          sortTime: date.getTime(),
        });

        return acc;
      }, [])
      .sort((left, right) => {
        if (left.kind !== 'item' || right.kind !== 'item') {
          return left.sortTime - right.sortTime;
        }

        const dateDiff = left.sortTime - right.sortTime;
        if (dateDiff !== 0) {
          return dateDiff;
        }

        return left.sortLabel.localeCompare(right.sortLabel);
      });
  }, [getItemDate, getItemSortLabel, getItemType, items, optionByType, visibleTypes]);

  const timelineNodes = useMemo(() => {
    const nodes: TimelineNode<TItem, TType>[] = [...filteredNodes];
    const rangeStart = dateRange?.startDate ? startOfDay(dateRange.startDate) : null;
    const rangeEnd = dateRange?.endDate ? startOfDay(dateRange.endDate) : null;
    const today = startOfDay(new Date());

    if (showTodayMarker && (!rangeStart || !isBefore(today, rangeStart)) && (!rangeEnd || !isAfter(today, rangeEnd))) {
      nodes.push({
        kind: 'today',
        sortTime: today.getTime(),
      });
    }

    return nodes.sort((left, right) => left.sortTime - right.sortTime);
  }, [dateRange?.endDate, dateRange?.startDate, filteredNodes, showTodayMarker]);

  useEffect(() => {
    if (!todayMarkerRef.current) {
      return;
    }

    todayMarkerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [timelineNodes]);

  const handleCheckboxChange = (type: TType) => (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setVisibleTypes((current) => {
      if (checked) {
        return current.includes(type) ? current : [...current, type];
      }

      const next = current.filter((item) => item !== type);
      return next.length > 0 ? next : current;
    });
  };

  const renderCard = (node: Extract<TimelineNode<TItem, TType>, { kind: 'item' }>, isTop: boolean) => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: alpha(node.option.color, 0.3),
        borderRadius: 3,
        boxShadow: 1,
        height: cardHeight,
        left: '50%',
        overflow: 'hidden',
        p: 1.5,
        position: 'absolute',
        top: isTop ? 0 : undefined,
        bottom: isTop ? undefined : 0,
        transform: 'translateX(-50%)',
        width: cardWidth,
      }}
    >
      {renderItemCard({
        color: node.option.color,
        date: node.date,
        item: node.item,
        position: isTop ? 'top' : 'bottom',
        type: node.option.key,
      })}
    </Box>
  );

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

  if (items.length <= 0) {
    return (
      <>
        <Alert severity="info">{emptyMessage}</Alert>
        {renderLegend()}
      </>
    );
  }

  if (filteredNodes.length <= 0) {
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
          overflowX: 'auto',
          pb: 1,
          pt: 1,
          scrollbarWidth: 'thin',
        }}
      >
        <Box
          sx={{
            minWidth: `max(100%, ${timelineNodes.length * columnWidth}px)`,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              bgcolor: alpha('#90A4AE', 0.45),
              height: 4,
              left: columnWidth / 2,
              position: 'absolute',
              right: columnWidth / 2,
              top: lineTop,
              zIndex: 0,
            }}
          />

          <Box sx={{ display: 'flex', px: 2 }}>
            {timelineNodes.map((node, index) => {
              const isTop = index % 2 === 0;

              if (node.kind === 'today') {
                const todayDate = new Date(node.sortTime);

                return (
                  <Box
                    key={`today-${node.sortTime}`}
                    ref={todayMarkerRef}
                    sx={{
                      flex: `0 0 ${columnWidth}px`,
                      height: itemHeight,
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: alpha('#00897B', 0.22),
                        height: topConnectorHeight,
                        left: '50%',
                        position: 'absolute',
                        top: topConnectorTop,
                        transform: 'translateX(-50%)',
                        width: 2,
                      }}
                    />
                    <Box
                      sx={{
                        alignItems: 'center',
                        bgcolor: '#00897B',
                        border: '4px solid',
                        borderColor: 'background.paper',
                        borderRadius: '50%',
                        boxShadow: `0 0 0 4px ${alpha('#00897B', 0.16)}`,
                        display: 'flex',
                        height: 26,
                        justifyContent: 'center',
                        left: '50%',
                        position: 'absolute',
                        top: lineTop - 13,
                        transform: 'translateX(-50%)',
                        width: 26,
                        zIndex: 1,
                      }}
                    >
                      <TodayOutlinedIcon sx={{ color: 'common.white', fontSize: 14 }} />
                    </Box>
                    <Typography
                      sx={{
                        color: '#00695C',
                        fontSize: 11,
                        fontWeight: 800,
                        left: '50%',
                        position: 'absolute',
                        textAlign: 'center',
                        top: lineTop + 24,
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}
                      variant="caption"
                    >
                      {defaultFormatDay(todayDate)} - Oggi
                    </Typography>
                  </Box>
                );
              }

              const Icon = node.option.icon;

              return (
                <Box
                  key={`${node.option.key}-${getItemKey(node.item)}`}
                  sx={{
                    flex: `0 0 ${columnWidth}px`,
                    height: itemHeight,
                    position: 'relative',
                  }}
                >
                  {isTop ? (
                    <>
                      {renderCard(node, true)}
                      <Box
                        sx={{
                          bgcolor: alpha(node.option.color, 0.24),
                          height: topConnectorHeight,
                          left: '50%',
                          position: 'absolute',
                          top: topConnectorTop,
                          transform: 'translateX(-50%)',
                          width: 2,
                        }}
                      />
                    </>
                  ) : null}

                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: node.option.color,
                      border: '4px solid',
                      borderColor: 'background.paper',
                      borderRadius: '50%',
                      boxShadow: `0 0 0 3px ${alpha(node.option.color, 0.18)}`,
                      display: 'flex',
                      height: dotSize,
                      justifyContent: 'center',
                      left: '50%',
                      position: 'absolute',
                      top: lineTop - dotHalf,
                      transform: 'translateX(-50%)',
                      width: dotSize,
                      zIndex: 1,
                    }}
                  >
                    <Icon sx={{ color: 'common.white', fontSize: 12 }} />
                  </Box>

                  <Typography
                    sx={{
                      color: 'text.primary',
                      fontSize: 11,
                      fontWeight: 700,
                      left: '50%',
                      letterSpacing: 0.3,
                      position: 'absolute',
                      textAlign: 'center',
                      top: lineTop + 24,
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                    }}
                    variant="caption"
                  >
                    {defaultFormatDay(node.date)}
                  </Typography>

                  {!isTop ? (
                    <>
                      <Box
                        sx={{
                          bgcolor: alpha(node.option.color, 0.24),
                          height: bottomConnectorHeight,
                          left: '50%',
                          position: 'absolute',
                          top: bottomConnectorTop,
                          transform: 'translateX(-50%)',
                          width: 2,
                        }}
                      />
                      {renderCard(node, false)}
                    </>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      {renderLegend()}
    </>
  );
};

export default HorizontalTimeline;
