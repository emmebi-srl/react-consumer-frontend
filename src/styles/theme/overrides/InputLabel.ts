import { Components, Theme } from '@mui/material';

// MUI default is 0.75: the shrunk label (and the notch in the outlined border) is slightly bigger and bolder
const SHRINK_SCALE = 0.9;
const SHRINK_FONT_WEIGHT = 600;
// MUI default is text.secondary (rgba(0, 0, 0, 0.6))
const SHRINK_COLOR = 'rgba(0, 0, 0, 0.75)';

function InputLabel(theme: Theme): Partial<Components<Theme>> {
  // The notch width comes from a hidden copy of the label inside <legend>, rendered at SHRINK_SCALE em.
  // The shrunk label is rendered at the same real font size (not with transform: scale), so both texts
  // measure the same and the border gap fits every label.
  const shrinkFontSize = `calc(${theme.typography.body1.fontSize} * ${SHRINK_SCALE})`;

  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.MuiInputLabel-animated': {
            transition: theme.transitions.create(['color', 'transform', 'max-width', 'font-size'], {
              duration: theme.transitions.duration.shorter,
              easing: theme.transitions.easing.easeOut,
            }),
          },
          '&.MuiInputLabel-outlined.MuiInputLabel-shrink': {
            transform: 'translate(13px, -11px) scale(1)',
            fontSize: shrinkFontSize,
            fontWeight: SHRINK_FONT_WEIGHT,
            maxWidth: 'calc(100% - 24px)',
          },
          // Keep MUI's focused/error/disabled colors
          '&.MuiInputLabel-shrink:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled)': {
            color: SHRINK_COLOR,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          '& legend': {
            fontSize: `${SHRINK_SCALE}em`,
            fontWeight: SHRINK_FONT_WEIGHT,
          },
        },
      },
    },
  };
}

export default InputLabel;
