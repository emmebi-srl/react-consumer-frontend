
import React from 'react';
import {storiesOf} from '@storybook/react';
import InstrumMeasuresRow from './InstrumMeasuresRowView';
import {List} from 'semantic-ui-react';
import {MASTER_SLAVE_MASTER_VALUE} from '../consts'

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      startVoltage: 120.01,
      nextVoltage:  145.41,
      restAbsorption: 150.00,
      alarmAbsorption: 555.55,
      hourAutonomy: 100,
      notes: "Individual properties of a shape, being shapes themselves."
    },
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
    .addWithJSX('Details Row - Instrum Measures', () =>  <InstrumMeasuresRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


