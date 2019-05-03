
import React from 'react';
import {storiesOf} from '@storybook/react';
import HeaderRow from './HeaderRowView';
import {List} from 'semantic-ui-react';

storiesOf('Checklists', module)
    .addDecorator(story => (
        <List>
            { story() }
        </List>
    ))
    .addWithJSX('Details Row - Header', () =>  
      <HeaderRow data={{header: "Header testing"}} />);


