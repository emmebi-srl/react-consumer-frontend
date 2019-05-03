
import React from 'react';
import {storiesOf} from '@storybook/react';
import {List} from 'semantic-ui-react';
import PowerSupplyRow from './PowerSupplyRowView';

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      brand: "Axel", 
      model: "Venice Plus 9200", 
      position: "Ala 2 settore 9", 
      ampere: 10.50, 
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
    .addWithJSX('Details Row - Power Supply', () =>  <PowerSupplyRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


