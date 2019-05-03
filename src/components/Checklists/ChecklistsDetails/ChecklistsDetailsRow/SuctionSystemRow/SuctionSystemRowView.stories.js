
import React from 'react';
import {storiesOf} from '@storybook/react';
import SuctionSystemRow from './SuctionSystemRowView';
import {List} from 'semantic-ui-react';
import {SUCTION_SYSTEM_TYPE_HIGH_SENSITIVITY} from '../consts'

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      brand: "Axel", 
      model: "Venice Plus 9200", 
      position: "Ala 2 settore 9", 
      suctionSystemType: SUCTION_SYSTEM_TYPE_HIGH_SENSITIVITY, 
      sensorNumber: "Numero di sensore",
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
    .addWithJSX('Details Row - Suction System', () =>  <SuctionSystemRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


