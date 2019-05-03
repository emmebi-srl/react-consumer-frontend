
import React from './node_modules/react';
import { storiesOf } from '@storybook/react';
import ChecklistsDetailsSidebarView from './ChecklistsDetailsSidebarView';

const data = {
  id: 15,
  checklistId: 2,
  name: "V.S. VERIFICHE DI SISTEMA centrale",
  description: "- sempre -",
  order: 4,
  paragraphModelId: 13,
  rows: [
      {
          id: 200,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  "header": "CONDIZIONI GENERALI CENTRALE"
              }
          },
          rowType: 4,
          rowModelId: 75,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 1,
          name: "condizioni generali",
          description: "CONDIZIONI GENERALI CENTRALE",
          employeeIndications: ""
      },
      {
          id: 201,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "3123123",
                  value: "2"
              }
          },
          rowType: 1,
          rowModelId: 76,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 2,
          name: "condizioni generali dell'impianto",
          description: "condizioni generali dell'impianto",
          employeeIndications: "modifiche strutturali"
      },
      {
          id: 202,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "123",
                  value: "1"
              }
          },
          rowType: 1,
          rowModelId: 77,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 3,
          name: "condizioni generali centrale",
          description: "condizioni generali centrale",
          employeeIndications: "presenza di guasti ed esclusioni ecc"
      },
      {
          id: 203,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "123123",
                  value: "2"
              }
          },
          rowType: 1,
          rowModelId: 78,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 4,
          name: "verifica test led ed lcd",
          description: "verifica test led ed lcd",
          employeeIndications: ""
      },
      {
          id: 204,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "",
                  value: "1"
              }
          },
          rowType: 1,
          rowModelId: 79,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 5,
          name: "esame generale dei pannelli e della centrale",
          description: "esame generale dei pannelli - della centrale - armadi",
          employeeIndications: "fissaggio - pulizia"
      },
      {
          id: 205,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  brand: "qweqwe",
                  masterSlave: "2",
                  model: "qweqwe",
                  notes: "eqweqwe",
                  position: "1231",
                  slaveId: "3123"
              }
          },
          rowType: 5,
          rowModelId: 80,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 6,
          name: "centrale ",
          description: "centrale ",
          employeeIndications: ""
      },
      {
          id: 206,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  ampere: 13,
                  month: 11,
                  notes: "Note riga ID 206",
                  quantity: 15,
                  year: 2018
              }
          },
          rowType: 7,
          rowModelId: 83,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 7,
          name: "centr batterie",
          description: "centr batterie",
          employeeIndications: ""
      },
      {
          id: 207,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  alarmAbsorption: 44,
                  hourAutonomy: 55,
                  nextVoltage: 22,
                  notes: "qweqwe",
                  restAbsorption: 33,
                  startVoltage: 11
              }
          },
          rowType: 8,
          rowModelId: 82,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 8,
          name: "centr strumentale",
          description: "centr strumentale",
          employeeIndications: ""
      },
      {
          id: 208,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "",
                  value: "2"
              }
          },
          rowType: 1,
          rowModelId: 158,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 9,
          name: "alimentazione tipo",
          description: "tipo alimentazione ",
          employeeIndications: "normale - privilegiata - ups - gruppo elettrogeno"
      },
      {
          id: 209,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  notes: "",
                  value: "2"
              }
          },
          rowType: 1,
          rowModelId: 92,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 10,
          name: "verifica logica funzionamento",
          description: "verifica logica funzionamento",
          employeeIndications: "descriverla nelle note separate"
      },
      {
          id: 210,
          checklistId: 2,
          paragraphId: 15,
          data: {
              nameValuePairs: {
                  ddnsPassword: "qweqwe",
                  ddnsServer: "432423234234",
                  ddnsUsername: "qweqwe",
                  externalIp: "eqweqwe",
                  internalIp: "2312",
                  notes: "",
                  password: "123123123",
                  peerToPeer: true,
                  peerToPeerNotes: "wqeqwe",
                  ping: "12eqwq",
                  ports: "123123",
                  serialNumber: "123123",
                  snmpVersion: "2",
                  username: "123123123"
              }
          },
          rowType: 12,
          rowModelId: 159,
          paragraphModelId: 13,
          checklistModelId: 4,
          order: 11,
          name: "connessione di rete",
          description: "connessione di rete",
          employeeIndications: ""
      }
  ]
}


storiesOf('Checklists', module)
    .addWithJSX('Details Paragraph', () =>  <ChecklistsDetailsSidebarView data={data} />);

