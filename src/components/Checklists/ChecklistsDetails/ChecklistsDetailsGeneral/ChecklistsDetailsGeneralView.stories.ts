
import React from 'react';
import { storiesOf } from '@storybook/react';
import ChecklistsDetailsGeneralView from './ChecklistsDetailsGeneralView';

const data = {
  "id":2,
  "mobileId":4,
  "executionDate":1523664000,
  "employeeId":1,
  "customerId":4531,
  "customerName":"EMMEBI S.R.L. a socio unico",
  "customerAddress":"Via dell'Artigianato, 2",
  "customerCity":"Pero di Breda di Piave (TV)",
  "systemCentral":"AX91020",
  "systemInstalledPlace": "Bella casa per tutti",
  "systemInstalledDate": 1523706996,
  "systemDepartments":"Dipartimento 1, dipartimento 2, dipartimento 3",
  "systemId":5425,
  "responsableId":null,
  "responsableName":"Mirco Barbon",
  "checklistModelId":4,
  "creationTimestamp":1523706996,
  "employeeSignature":null,
  "customerSignature":null,
  "others":null,
  "notes":null,
  "responsableJob":"El paron dea baracca",
  "periodicCheck":4,
  "visitNumber":44,
  "isViewed":false,
  "isPrinted":false,
  "isSent":false,
  "employees":null,
  "reports":null,
  "system":{
    "id":5425,
    "customerId":4531,
    "subscriptionId":0,
    "operationDate":1471824000,
    "warrantlyDeadline":0,
    "type":4,"status":0,
    "description":"test 3",
    "destinationId":1,
    "central":"","gsm":"","dialer":"","sked":0},
    "customer":{"id":4531,"companyName":"EMMEBI S.R.L. a socio unico","taxCode":"04371390263","vat":"04371390263","status":null,"isInsolvent":false}
}
storiesOf('Checklists', module)
    .addWithJSX('Details General', () => {
      return <ChecklistsDetailsGeneralView checklist={data} />
    } );

