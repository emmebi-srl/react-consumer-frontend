import React, { PropsWithChildren } from 'react';
import { ChecklistParagraph, ChecklistRow, ChecklistRowTypeEnum } from '~/types/aries-proxy/checklists';
import { Stack, Typography } from '@mui/material';
import BatteryInfoRow from './ChecklistsDetailsRow/BatteryInfoRow';
import { useEditMode } from '../state';
import InfoAndPrecautionsRow from './ChecklistsDetailsRow/InfoAndPrecautionsRow';
import ToggleConfirmRow from './ChecklistsDetailsRow/ToggleConfirmRow';
import NotesRow from './ChecklistsDetailsRow/NotesRow';
import HeaderRow from './ChecklistsDetailsRow/HeaderRow';
import DateNoteRow from './ChecklistsDetailsRow/DateNoteRow';
import CentralInfoRow from './ChecklistsDetailsRow/CentralInfoRow';
import MasterSlaveRow from './ChecklistsDetailsRow/MasterSlaveRow';
import InstrumMeasuresRow from './ChecklistsDetailsRow/InstrumMeasuresRow';
import ConfigurationLanRow from './ChecklistsDetailsRow/ConfigurationLanRow';
import PowerSupplyRow from './ChecklistsDetailsRow/PowerSupplyRow';
import SuctionSystemRow from './ChecklistsDetailsRow/SuctionSystemRow';

interface SwitchedRowProps {
  row: ChecklistRow;
  rowIndex: number;
  paragraphIndex: number;
}

const SwitchedRow: React.FC<SwitchedRowProps> = ({ row, rowIndex, paragraphIndex }) => {
  const [editMode] = useEditMode();
  const commonProps = {
    rowIndex,
    paragraphIndex,
    readOnly: !editMode,
    onChange: () => {
      throw new Error('Not implemented yet');
    },
  };
  switch (row.rowType) {
    case ChecklistRowTypeEnum.ToggleConfirm:
      return <ToggleConfirmRow data={row.data.nameValuePairs} {...commonProps} hasNa={false} />;

    case ChecklistRowTypeEnum.ToggleNullConfirm:
      return <ToggleConfirmRow data={row.data.nameValuePairs} {...commonProps} hasNa={true} />;

    case ChecklistRowTypeEnum.Notes:
      return <NotesRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.CentralInfo:
      return <CentralInfoRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.MasterSlave:
      return <MasterSlaveRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.BatterySpec:
      return <BatteryInfoRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.InstrumMeasures:
      return <InstrumMeasuresRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.PowerSupplyInfo:
      return <PowerSupplyRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.SuctionSystem:
      return <SuctionSystemRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.DateNotes:
      return <DateNoteRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.ConfigurationLan:
      return <ConfigurationLanRow data={row.data.nameValuePairs} {...commonProps} />;

    case ChecklistRowTypeEnum.ToggleNullConfirmQty:
      return <ToggleConfirmRow data={row.data.nameValuePairs} {...commonProps} hasNa={true} />;

    case ChecklistRowTypeEnum.InfoAndPrecautions:
      return <InfoAndPrecautionsRow data={row.data.nameValuePairs} />;

    default:
      throw new Error(`[ChecklistsDetailsParagraphView::getRow] Invalid row type = ${row.rowType}.`);
  }
};

const ChecklistRowWrapper: React.FC<PropsWithChildren<{ description: string; helpText?: string }>> = ({
  children,
  description,
  helpText,
}) => {
  return (
    <Stack
      direction="column"
      gap={2}
      py={2}
      sx={{
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.divider,
      }}
    >
      <Typography variant="h6">{description}</Typography>
      {children}
      {helpText ? (
        <Typography variant="body2" color="textSecondary">
          {helpText}
        </Typography>
      ) : null}
    </Stack>
  );
};

interface ChecklistsDetailsParagraphProps {
  data: ChecklistParagraph;
  paragraphIndex: number;
}

const ChecklistsDetailsParagraph: React.FC<ChecklistsDetailsParagraphProps> = (props) => {
  const { data, paragraphIndex } = props;
  const { rows } = data;

  return (
    <Stack direction="column" gap={2}>
      {rows?.map((row, index) => {
        if (row.rowType === ChecklistRowTypeEnum.Header) {
          return (
            <HeaderRow key={`checklist_row_${row.paragraphId}_${row.id}`} header={row.data.nameValuePairs.header} />
          );
        }

        return (
          <ChecklistRowWrapper
            key={`checklist_row_${row.paragraphId}_${row.id}`}
            description={row.description}
            helpText={row.employeeIndications}
          >
            <SwitchedRow paragraphIndex={paragraphIndex} rowIndex={index} row={row} />
          </ChecklistRowWrapper>
        );
      })}
    </Stack>
  );
};

export default ChecklistsDetailsParagraph;
