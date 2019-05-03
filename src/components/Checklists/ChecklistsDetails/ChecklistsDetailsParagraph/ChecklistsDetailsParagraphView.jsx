import React from 'react'
import PropTypes from 'prop-types'
import {
  CHECKLIST_ROW_TYPE_TOGGLE_CONFIRM,
  CHECKLIST_ROW_TYPE_TOGGLE_NULL_CONFIRM,
  CHECKLIST_ROW_TYPE_NOTES,
  CHECKLIST_ROW_TYPE_HEADER,
  CHECKLIST_ROW_TYPE_CENTRAL_INFO,
  CHECKLIST_ROW_TYPE_MASTER_SLAVE,
  CHECKLIST_ROW_TYPE_BATTERY_SPEC,
  CHECKLIST_ROW_TYPE_INSTRUM_MEASURES,
  CHECKLIST_ROW_TYPE_POWER_SUPPLY_INFO,
  CHECKLIST_ROW_TYPE_SUCTION_SYSTEM,
  CHECKLIST_ROW_TYPE_DATE_NOTES,
  CHECKLIST_ROW_TYPE_CONFIGURATION_LAN,
  CHECKLIST_ROW_TYPE_TOGGLE_NULL_CONFIRM_QTY,
  CHECKLIST_ROW_TYPE_INFO_AND_PRECAUTIONS, 
} from '../../consts'
import {
  BatteryInfoRow,
  CentralInfoRow, 
  ConfigurationLanRow, 
  DateNoteRow, 
  HeaderRow, 
  InfoAndPrecautionsRow, 
  InstrumMeasuresRow, 
  MasterSlaveRow, 
  NotesRow, 
  PowerSupplyRow, 
  SuctionSystemRow, 
  ToggleConfirmRow,
} from '../ChecklistsDetailsRow';
import {List} from '../../../UI';
import styled from 'styled-components';
import { NoMarginTop, LightGrey } from '../../../../styles';

const SyledList = styled(List)`
  ${NoMarginTop}
  border-top: 1px solid ${LightGrey};
  border-left: 1px solid ${LightGrey};
  margin-left: -1px;
`
const SwitchedRow = ({row, rowIndex, paragraphIndex, editMode}) => {
  const options = {
    editMode: editMode
  };

  const commonProps = { 
    data: row,
    rowIndex, 
    paragraphIndex,
  }

  switch(row.rowType) {
    case CHECKLIST_ROW_TYPE_TOGGLE_CONFIRM: 
      return <ToggleConfirmRow {...commonProps} options={{...options, hasNa: false, hasQuantity: false}}/>

    case CHECKLIST_ROW_TYPE_TOGGLE_NULL_CONFIRM: 
      return <ToggleConfirmRow {...commonProps} options={{...options, hasNa: true, hasQuantity: false}}/>

    case CHECKLIST_ROW_TYPE_NOTES: 
      return <NotesRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_HEADER: 
      return <HeaderRow  {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_CENTRAL_INFO: 
      return <CentralInfoRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_MASTER_SLAVE: 
      return <MasterSlaveRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_BATTERY_SPEC: 
      return <BatteryInfoRow  {...commonProps} options={options}/>
      
    case CHECKLIST_ROW_TYPE_INSTRUM_MEASURES: 
      return <InstrumMeasuresRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_POWER_SUPPLY_INFO: 
      return <PowerSupplyRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_SUCTION_SYSTEM: 
      return <SuctionSystemRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_DATE_NOTES: 
      return <DateNoteRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_CONFIGURATION_LAN: 
      return <ConfigurationLanRow {...commonProps} options={options}/>

    case CHECKLIST_ROW_TYPE_TOGGLE_NULL_CONFIRM_QTY: 
      return <ToggleConfirmRow {...commonProps} options={{...options, hasNa: true, hasQuantity: true}}/>

    case CHECKLIST_ROW_TYPE_INFO_AND_PRECAUTIONS: 
      return <InfoAndPrecautionsRow {...commonProps} options={options}/>

    default: throw new Error(`[ChecklistsDetailsParagraphView::getRow] Invalid row type = ${row.rowType}.`);
  }
};

class ChecklistsDetailsParagraph extends React.Component {

  shouldComponentUpdate(nextProps) {
    const { data, paragraphIndex, editMode } = this.props;
    const { rows } = data;
    
    return paragraphIndex !== nextProps.paragraphIndex || 
      editMode !== nextProps.editMode ||
      JSON.stringify(rows) !== JSON.stringify(nextProps.data.rows);
  }

  render() {
    const {data, paragraphIndex, editMode} = this.props;
    const {rows} = data;

    return (
      <div>
        <SyledList 
          celled>
          {rows.map((row, index)=> {
            return <SwitchedRow editMode={editMode} paragraphIndex={paragraphIndex} rowIndex={index} key={`checklist_row_${row.paragraphId}_${row.id}`} row={row}/>
          })}
        </SyledList>
      </div>
    )
  }
};

// PropTypes
ChecklistsDetailsParagraph.propTypes = {
  data: PropTypes.object.isRequired, 
  changeIsCollapsedStatus: PropTypes.func.isRequired,
  paragraphIndex: PropTypes.number.isRequired,
};

export default ChecklistsDetailsParagraph;

