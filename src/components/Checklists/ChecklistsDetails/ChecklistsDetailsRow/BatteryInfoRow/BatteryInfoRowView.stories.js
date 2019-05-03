
import React from 'react';
import {storiesOf} from '@storybook/react';
import BatteryInfoRow from './BatteryInfoRowView';
import {List} from 'semantic-ui-react';
import {MASTER_SLAVE_MASTER_VALUE} from '../consts'

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      year: 2000, 
      month: 1, 
      quantity: 10,
      ampere: 10.50,
      notes: "Individual properties of a shape, being shapes themselves."
    }
  }, 
  employeeIndications: "Greenpoint's best choice for quick and delicious sushi."
}

const options = {
  readonly: false
}


storiesOf('Checklists', module)
    .addDecorator(story => (
        <List>
            { story() }
        </List>
    ))
    .addWithJSX('Details Row - Battery Info', () =>  <BatteryInfoRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


