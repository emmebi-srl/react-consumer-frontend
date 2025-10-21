import React from 'react';
import {Router} from 'react-router-dom'
import { storiesOf } from '@storybook/react';
import ChecklistListRow from './ChecklistsListRowView';
import { Table } from 'semantic-ui-react';

const data = {
    id: 1001, 
    executionDate: 1526628401000,
    customer: {
        companyName: 'SIRAM SPA'
    }, 
    system: {
        description: 'FU AX209 SIRAM'
    }, 
    checklistType: 'ANTIFURTO',
}

const WrapperTamplate = ({children}) => (
    <Table> 
      <Table.Body>
        {children}
      </Table.Body>
    </Table>
);

storiesOf('Checklists', module)
    .addWithJSX('List Row', () =>
        <WrapperTamplate>
            <ChecklistListRow data={data} />
        </WrapperTamplate>);

