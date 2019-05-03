
import React from 'react';
import {storiesOf} from '@storybook/react';
import ConfigurationLanRowView from './ConfigurationLanRowView';
import {List} from 'semantic-ui-react';
import {SNPM_VERSION_2} from '../consts'

const data = {
  description: 'A list can contain a description',
  data: {
    nameValuePairs: {
      serialNumber: 'A123456B', 
      internalIp: '192.178.12.100', 
      externalIp: '192.178.12.100', 
      username: 'username', 
      password: 'password', 
      ports: '1992,1993',
      peerToPeer: true,
      peerToPeerNotes: 'Note for Peer To Peer',
      snmpVersion: SNPM_VERSION_2,
      ping: 'ping xyz',
      ddnsServer: 'ddns server',
      ddnsUsername: 'ddns username',
      ddnsPassword: 'ddns password',
      notes: "Individual properties of a shape, being shapes themselves.",
    }
  }, 
  employeeIndications: "Greenpoint's best choice for quick and delicious sushi.",
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
    .addWithJSX('Details Row - Configuration Lan', () =>  <ConfigurationLanRowView data={data} options={options} onChange={(newData) => {
        data.data = newData;
      }}/>);


