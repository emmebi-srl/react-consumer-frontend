
import React from 'react';
import {storiesOf} from '@storybook/react';
import NotesRowView from './NotesRowView';
import {List} from 'semantic-ui-react';

const data = {
  description: "A list can contain a description",
  data: {
    nameValuePairs: {
      notes: "Individual properties of a shape, being shapes themselves."
    }, 
  },
  employeeIndications: "Greenpoint's best choice for quick and delicious sushi."
}

const options = {
  readonly: false,
}


storiesOf('Checklists', module)
    .addDecorator(story => (
        <List>
            { story() }
        </List>
    ))
    .addWithJSX('Details Row - Notes', () =>  <NotesRowView data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


