import { Box, Icon, IconButton, styled, useTheme } from '@mui/material';
import { Money } from '~/types/money';
import { formatMoneyShort } from '~/utils/money';
import { useState } from 'react';
import { ArrowDownward, ArrowUpward, CompareArrows, TrendingDown, TrendingUp } from '@mui/icons-material';
import MonospaceTypography from '../Typographies/MonospacedTypography';

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

interface TotalAmount {
  negative?: Money;
  net?: Money;
  positive: Money;
}

interface Props {
  breakdown?: TotalAmount[];
  total: TotalAmount;
}

const AmountBox: React.FC<{ value?: Money; icon: React.ReactElement }> = ({ value, icon }) => {
  const theme = useTheme();

  if (!value) return;

  return (
    <Box display="flex" gap={1} alignItems="center" justifyContent="end" width={theme.spacing(20)}>
      {icon}
      <MonospaceTypography variant="subtitle1">{formatMoneyShort(value)}</MonospaceTypography>
    </Box>
  );
};

const BreakdownAmountBox: React.FC<{ value?: Money }> = ({ value }) => {
  const theme = useTheme();

  if (!value) return;

  return (
    <MonospaceTypography variant="subtitle2" textAlign="right" width={theme.spacing(20)}>
      {formatMoneyShort(value)}
    </MonospaceTypography>
  );
};

const FilteredAmounts: React.FC<Props> = ({ breakdown, total }) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const hasNonTotalCurrency = breakdown?.some((el) => el.positive.currency !== total.positive.currency);
  const ChevronIcon = breakdownOpen ? ArrowUpward : ArrowDownward;

  return (
    <Container>
      <Box display="flex" flexDirection="row" gap={3} alignItems="center">
        <AmountBox value={total.negative} icon={<Icon component={TrendingDown} fontSize="small" color="error" />} />
        <AmountBox value={total.positive} icon={<Icon component={TrendingUp} fontSize="small" color="success" />} />

        <AmountBox value={total.net} icon={<Icon component={CompareArrows} fontSize="small" />} />

        <IconButton
          onClick={() => setBreakdownOpen(!breakdownOpen)}
          size="small"
          sx={{ display: hasNonTotalCurrency ? 'initial' : 'none' }}
        >
          <Icon component={ChevronIcon} fontSize="small" color="primary" />
        </IconButton>
      </Box>

      {breakdownOpen &&
        breakdown?.map((breakdownTotal) => (
          <Box display="flex" flexDirection="row" gap={3} alignItems="end" key={breakdownTotal.positive.currency}>
            <BreakdownAmountBox value={breakdownTotal.negative} />
            <BreakdownAmountBox value={breakdownTotal.positive} />
            <BreakdownAmountBox value={breakdownTotal.net} />
          </Box>
        ))}
    </Container>
  );
};

export default FilteredAmounts;
