import React from 'react';
import { storiesOf } from '@storybook/react';
import ChecklistList from './ChecklistsListView';
import { Table } from 'semantic-ui-react';

const data = {
    list: [{
        id: 1001, 
        executionDate: 1526628401000,
        customer: {
            companyName: 'SIRAM SPA'
        }, 
        system: {
            description: 'FU AX209 SIRAM'
        }, 
        checklistType: 'ANTIFURTO',
    }, 
    {
        id: 1002, 
        executionDate: 1526627401000,
        customer: {
            companyName: 'RENO DE MEDICI'
        }, 
        system: {
            description: 'FU AX209 RENO'
        }, 
        checklistType: 'EVAC',
    },
    {
        id: 1003, 
        executionDate: 1526528401000,
        customer: {
            companyName: 'EMMEBI SRL a socio unico'
        }, 
        system: {
            description: 'AX 9127 MAYBE'
        }, 
        checklistType: 'ANTINCENDIO',
    }]
}

storiesOf('Checklists', module)
    .addWithJSX('List', () => <ChecklistList isLoading={false} data={data} />);

