import React from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { ChecklistRowDataInfoAndPrecautions } from '~/types/aries-proxy/checklists';

interface InfoAndPrecautionsRowProps {
  data: ChecklistRowDataInfoAndPrecautions;
}
const InfoAndPrecautionsRow: React.FC<InfoAndPrecautionsRowProps> = ({ data }) => {
  const { value } = data;

  return (
    <Box>
      <FormControlLabel
        control={<Checkbox checked={value} readOnly={true} />}
        label="Ho preso visione e capito le indicazioni descritte sopra."
      />
    </Box>
  );
};

export default InfoAndPrecautionsRow;
