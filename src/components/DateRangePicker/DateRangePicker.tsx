import { useMemo, useState } from 'react';
import { CalendarMonth } from '@mui/icons-material';
import { Box, Button, Chip, Divider, Popover, Stack, TextField, Typography } from '@mui/material';
import {
  Locale,
  addMonths,
  addYears,
  endOfMonth,
  format,
  isAfter,
  parseISO,
  startOfMonth,
  startOfYear,
} from 'date-fns';

export interface DateRangeValue {
  endDate?: Date;
  startDate?: Date;
}

export interface DateRangeItem {
  endDate: Date;
  label: string;
  startDate: Date;
}

interface DateRangePickerProps {
  allowFuture?: boolean;
  dataTestId?: string;
  definedRanges?: DateRangeItem[];
  locale?: Locale;
  onChange: (dateRange: DateRangeValue) => void;
  value?: DateRangeValue;
}

const toInputValue = (date?: Date) => (date ? format(date, 'yyyy-MM-dd') : '');

const fromInputValue = (value: string) => (value ? parseISO(`${value}T00:00:00`) : undefined);

const isSameDate = (left?: Date, right?: Date) => {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return left.getTime() === right.getTime();
};

const getDefaultRanges = (today: Date, allowFuture?: boolean): DateRangeItem[] => [
  {
    endDate: allowFuture ? endOfMonth(addMonths(today, 1)) : endOfMonth(today),
    label: 'Questo mese',
    startDate: startOfMonth(today),
  },
  {
    endDate: endOfMonth(today),
    label: 'Ultimi 6 mesi',
    startDate: startOfMonth(addMonths(today, -5)),
  },
  {
    endDate: endOfMonth(today),
    label: 'Ultimi 12 mesi',
    startDate: startOfMonth(addMonths(today, -11)),
  },
  {
    endDate: allowFuture ? endOfMonth(addYears(today, 1)) : endOfMonth(today),
    label: 'Anno corrente',
    startDate: startOfYear(today),
  },
];

const getButtonLabel = (value: DateRangeValue = {}) => {
  const { endDate, startDate } = value;

  if (!startDate || !endDate) {
    return 'Intervallo date';
  }

  return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  allowFuture,
  dataTestId,
  definedRanges,
  locale,
  onChange,
  value,
}) => {
  const today = useMemo<Date>(() => new Date(), []);
  const quickRanges = useMemo(
    () => definedRanges ?? getDefaultRanges(today, allowFuture),
    [allowFuture, definedRanges, today],
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(value ?? {});
  const currentValue = value ?? {};

  const open = Boolean(anchorEl);
  const maxDate = allowFuture ? addYears(today, 10) : today;
  const minDate = addYears(today, -10);
  const hasSelectedValue = Boolean(currentValue.startDate && currentValue.endDate);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDraftRange(currentValue);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleQuickRangeClick = (range: DateRangeItem) => {
    setDraftRange(range);
    onChange(range);
    handleClose();
  };

  const handleApply = () => {
    if (!draftRange.startDate || !draftRange.endDate) {
      return;
    }

    const normalizedStartDate = isAfter(draftRange.startDate, draftRange.endDate)
      ? draftRange.endDate
      : draftRange.startDate;
    const normalizedEndDate = isAfter(draftRange.startDate, draftRange.endDate)
      ? draftRange.startDate
      : draftRange.endDate;

    onChange({
      endDate: normalizedEndDate,
      startDate: normalizedStartDate,
    });
    handleClose();
  };

  const handleReset = () => {
    const resetRange = getDefaultRanges(today, allowFuture)[1] ?? {
      endDate: endOfMonth(today),
      label: 'Ultimi 6 mesi',
      startDate: startOfMonth(addMonths(today, -5)),
    };

    setDraftRange(resetRange);
    onChange(resetRange);
    handleClose();
  };

  return (
    <>
      <Button
        color="primary"
        data-testid={dataTestId}
        onClick={handleOpen}
        size="small"
        startIcon={<CalendarMonth fontSize="small" />}
        sx={{ alignSelf: { md: 'flex-start', xs: 'stretch' }, minWidth: { md: 260, xs: '100%' } }}
        variant="outlined"
      >
        {getButtonLabel(currentValue)}
      </Button>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={handleClose}
        open={open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box sx={{ maxWidth: 420, p: 2.5, width: '100%' }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1">Intervallo date</Typography>
              <Typography color="text.secondary" variant="body2">
                Seleziona il periodo da applicare alla dashboard.
              </Typography>
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {quickRanges.map((range) => (
                <Chip
                  key={range.label}
                  color={
                    isSameDate(draftRange.startDate, range.startDate) && isSameDate(draftRange.endDate, range.endDate)
                      ? 'primary'
                      : 'default'
                  }
                  label={range.label}
                  onClick={() => handleQuickRangeClick(range)}
                  size="small"
                  variant={
                    isSameDate(draftRange.startDate, range.startDate) && isSameDate(draftRange.endDate, range.endDate)
                      ? 'filled'
                      : 'outlined'
                  }
                />
              ))}
            </Stack>

            <Divider />

            <Stack direction={{ md: 'row', xs: 'column' }} spacing={1.5}>
              <TextField
                fullWidth
                inputProps={{
                  max: toInputValue(maxDate),
                  min: toInputValue(minDate),
                }}
                label="Da"
                onChange={(event) =>
                  setDraftRange((currentRange) => ({
                    ...currentRange,
                    startDate: fromInputValue(event.target.value),
                  }))
                }
                size="small"
                InputLabelProps={{ shrink: true }}
                type="date"
                value={toInputValue(draftRange.startDate)}
              />
              <TextField
                fullWidth
                inputProps={{
                  max: toInputValue(maxDate),
                  min: toInputValue(minDate),
                }}
                label="A"
                onChange={(event) =>
                  setDraftRange((currentRange) => ({
                    ...currentRange,
                    endDate: fromInputValue(event.target.value),
                  }))
                }
                size="small"
                InputLabelProps={{ shrink: true }}
                type="date"
                value={toInputValue(draftRange.endDate)}
              />
            </Stack>

            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
              <Typography color="text.secondary" variant="body2">
                {hasSelectedValue ? getButtonLabel(currentValue) : locale ? format(today, 'MMMM yyyy', { locale }) : ''}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button onClick={handleReset} size="small">
                  Reset
                </Button>
                <Button
                  disabled={!draftRange.startDate || !draftRange.endDate}
                  onClick={handleApply}
                  size="small"
                  variant="contained"
                >
                  Applica
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default DateRangePicker;
