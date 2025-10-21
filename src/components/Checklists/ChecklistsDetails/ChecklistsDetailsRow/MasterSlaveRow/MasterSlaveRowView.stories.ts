
import React from 'react';
import {storiesOf} from '@storybook/react';
import MasterSlaveRow from './MasterSlaveRowView';
import {List} from 'semantic-ui-react';
import {MASTER_SLAVE_MASTER_VALUE} from '../consts'

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      masterSlave: MASTER_SLAVE_MASTER_VALUE, 
      slaveId: "Slave 19920",
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
    .addWithJSX('Details Row - Master Slave', () =>  <MasterSlaveRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


