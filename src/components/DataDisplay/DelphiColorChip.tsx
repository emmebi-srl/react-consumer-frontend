import { Chip, ChipProps } from '@mui/material';
import { getReadableTextColor, normalizeToHexColor } from '~/utils/color-utils';

interface Props extends Omit<ChipProps, 'color' | 'label'> {
  label: string;
  // Raw color as stored by the Delphi app (e.g. "clRed", "$000000FF", "255").
  delphiColor?: string | null;
}

// Status chip colored with a Delphi-stored color. Falls back to a neutral outlined chip when
// the color is missing or not convertible (e.g. OS-dependent system colors).
const DelphiColorChip: React.FC<Props> = ({ label, delphiColor, sx, ...props }) => {
  const backgroundColor = normalizeToHexColor(delphiColor);

  if (!backgroundColor) {
    return <Chip size="small" variant="outlined" label={label} sx={sx} {...props} />;
  }

  return (
    <Chip
      size="small"
      label={label}
      sx={[
        {
          bgcolor: backgroundColor,
          color: getReadableTextColor(backgroundColor),
          border: '1px solid',
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
};

export default DelphiColorChip;
