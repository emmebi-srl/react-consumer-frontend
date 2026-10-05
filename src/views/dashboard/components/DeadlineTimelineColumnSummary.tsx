import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { TimelineSchedulerColumnSummaryParams, TimelineTypeOption } from '~/components/Timeline';
import { DashboardTimelineItem } from '~/types/aries-proxy/dashboard';
import { formatMoney, newMoney, sumMoney } from '~/utils/money';

type TimelineType = DashboardTimelineItem['type'];

interface Props {
  nodes: TimelineSchedulerColumnSummaryParams<DashboardTimelineItem, TimelineType>['nodes'];
  typeOptions: TimelineTypeOption<TimelineType>[];
}

const typesWithAmount: TimelineType[] = ['periodic-check'];

const DeadlineTimelineColumnSummary = ({ nodes, typeOptions }: Props) => {
  const rows = typeOptions.map((option) => {
    const typeNodes = nodes.filter((node) => node.type === option.key);
    const openNodes = typeNodes.filter((node) => node.isOpen);
    const pricedOpenNodes = typesWithAmount.includes(option.key)
      ? openNodes.filter((node) => typeof node.item.amount === 'number')
      : [];
    const openAmount = pricedOpenNodes.reduce(
      (total, node) => sumMoney(total, newMoney(node.item.amount ?? 0, 'EUR')),
      newMoney(0, 'EUR'),
    );

    return {
      closed: typeNodes.length - openNodes.length,
      color: option.color,
      hasAmount: pricedOpenNodes.length > 0,
      label: option.label,
      open: openNodes.length,
      openAmount,
      total: typeNodes.length,
    };
  });

  if (rows.every((row) => row.total === 0)) {
    return null;
  }

  // One fixed slot per type so the chips line up across month columns.
  return (
    <Box
      aria-label="Riepilogo del mese"
      sx={{ display: 'grid', gridTemplateColumns: `repeat(${rows.length}, 1fr)`, mt: 0.5 }}
    >
      {rows.map((row) =>
        row.total > 0 ? (
          <Tooltip
            key={row.label}
            title={`${row.label}: ${row.open} aperte, ${row.closed} chiuse${
              row.hasAmount ? `, ${formatMoney(row.openAmount)} aperti` : ''
            }`}
          >
            <Stack alignItems="center" direction="row" spacing={0.5}>
              <Box sx={{ bgcolor: row.color, borderRadius: '50%', flexShrink: 0, height: 7, width: 7 }} />
              <Typography sx={{ fontFeatureSettings: '"tnum"', fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
                {row.open}
                {row.closed > 0 ? (
                  <Typography
                    color="text.secondary"
                    component="span"
                    sx={{ fontSize: 'inherit', fontWeight: 600, lineHeight: 'inherit' }}
                  >
                    ·{row.closed}
                  </Typography>
                ) : null}
              </Typography>
            </Stack>
          </Tooltip>
        ) : (
          <Box key={row.label} />
        ),
      )}
    </Box>
  );
};

export default DeadlineTimelineColumnSummary;
