import { Tooltip } from '@mui/material';
import { ErrorLabel, MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useEllipsisTooltip } from '~/hooks/useEllipsisTooltip';

interface Props {
  label: string | undefined;
  variant?: 'main' | 'secondary' | 'error';
}

const LabelWithTooltip: React.FC<Props> = ({ label, variant = 'main' }) => {
  const { ref, title } = useEllipsisTooltip(label);
  switch (variant) {
    case 'main':
      return (
        <Tooltip title={title}>
          <MainLabel ref={ref}>{label}</MainLabel>
        </Tooltip>
      );

    case 'secondary':
      return (
        <Tooltip title={title}>
          <SecondaryLabel ref={ref}>{label}</SecondaryLabel>
        </Tooltip>
      );

    case 'error':
      return (
        <Tooltip title={title}>
          <ErrorLabel ref={ref}>{label}</ErrorLabel>
        </Tooltip>
      );
  }
};

export default LabelWithTooltip;
