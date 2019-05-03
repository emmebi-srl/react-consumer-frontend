import React from 'react';
import PropTypes from 'prop-types';
import {List} from '../../../../UI';
import Description from '../CommonDescription';
import styled from 'styled-components';
import { CardPadding } from '../../../../../styles';
import { stringToFloat } from '../../../../../utils/string-to-float';
import { stringToInt } from '../../../../../utils/string-to-int';

export const StyledItem = styled(List.Item)`
  ${CardPadding}
`
const StyledComponentCnt = styled.div`
  margin: 5px 0;
`
const EmployeeIndicationsCnt = styled.div`
  margin-top: 5px;
`

const CommonRowWrapper = (Component) => ({item, onChange, options, rowIndex, paragraphIndex}) => {
  const {description, employeeIndications} = item;
  const nameValuePairs = item.data.nameValuePairs; 
  
  const handleChange = ({field, value, type}) => {
    let fn = null;
    switch (type) {
      case 'float':
        fn = handleFloatChange;
        break;
      case 'string':
        fn = handleStringChange;
        break;
      case 'radio':
        fn = handleRadioChange;
        break;
      case 'integer':
        fn = handleIntegerChange;
        break;
      case 'boolean':
        fn = handleBooleanChange;
        break;
      default:
        fn = handleStringChange;
        break;
    }
    fn({value, field});
    const data = {nameValuePairs}
    onChange({data, rowIndex, paragraphIndex});
  }
  
  const handleFloatChange = ({field, value}) => {
    nameValuePairs[field] = stringToFloat(value);
  }
  const handleIntegerChange = ({field, value}) => {
    nameValuePairs[field] = stringToInt(value);
  }
  const handleStringChange = ({field, value}) => {
    nameValuePairs[field] = value;
  }
  const handleRadioChange = ({field, value}) => {
    nameValuePairs[field] = value;
  }
  const handleBooleanChange = ({field, value}) => {
    nameValuePairs[field] = value;
  }

  return (
    <StyledItem>
      <Description value={description}/>
      <StyledComponentCnt> 
        <Component onChange={handleChange} data={nameValuePairs} options={options}/> 
      </StyledComponentCnt>
      <EmployeeIndicationsCnt>{employeeIndications}</EmployeeIndicationsCnt>
    </StyledItem>
  )
};

// PropTypes
CommonRowWrapper.propTypes = {
  data: PropTypes.object.isRequired, 
  rowIndex: PropTypes.number.isRequired,
  paragraphIndex: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired, 
  options: PropTypes.object,
};

export default CommonRowWrapper;