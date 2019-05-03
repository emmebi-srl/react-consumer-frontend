
import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import CommonRowWrapper from './CommonRowWrapperView'
import List from '../../../../UI/List'

const data = {
    description: "A list can contain a description",
    data: {

    }, 
    employeeIndications: "Greenpoint's best choice for quick and delicious sushi."
}

const Component = CommonRowWrapper(() => (<div> Content </div>));

storiesOf('Checklists', module)
    .addDecorator(story => (
        <List>
            { story() }
        </List>
    ))
    .addWithJSX('Details Row - Common wrapper', () =>  <Component item={data} />);

