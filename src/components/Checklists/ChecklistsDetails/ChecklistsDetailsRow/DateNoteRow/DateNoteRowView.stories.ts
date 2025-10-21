
import React from 'react';
import {storiesOf} from '@storybook/react';
import {List} from 'semantic-ui-react';
import DateNoteRow from './DateNoteRowView';

const data = {
  description: 'A list can contain a description',
  data: {
    nameValuePairs: {
      date: 1526628401000, 
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
    .addWithJSX('Details Row - Date Note', () =>  <DateNoteRow data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


