
import React from 'react';
import {storiesOf} from '@storybook/react';
import ToggleConfirmRow from './ToggleConfirmRowView';
import {List} from 'semantic-ui-react';

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      value: 1, 
      notes: "Individual properties of a shape, being shapes themselves."
    }, 
  },
  employeeIndications: "Greenpoint's best choice for quick and delicious sushi."
}

const options = {
  hasNa: false,
  hasQuantity: false, 
  readonly: false
}


storiesOf('Checklists', module)
    .addDecorator(story => (
        <List>
            { story() }
        </List>
    ))
    .addWithJSX('Details Row - Toggle Confirm', () =>  <ToggleConfirmRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>)
    .addWithJSX('Details Row - Toggle Confirm (hasNa === true)', () =>  
      <ToggleConfirmRow data={data} options={{...options, hasNa: true}} onChange={(newData) => {
        data.data = newData;
      }}/>)
    .addWithJSX('Details Row - Toggle Confirm (hasQuantity === true)', () =>  
      <ToggleConfirmRow data={data} options={{...options, hasNa: true, hasQuantity: true}} onChange={(newData) => {
        data.data = newData;
      }}/>);


