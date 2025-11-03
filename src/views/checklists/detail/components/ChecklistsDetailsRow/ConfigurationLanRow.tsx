import React from 'react';
import { FormControl, FormControlLabel, FormLabel, Grid, RadioGroup, TextField, Checkbox, Radio } from '@mui/material';
import { ChecklistRowDataConfigurationLan, ChecklistSnmpVersionEnum } from '~/types/aries-proxy/checklists';
import { Stack } from '@mui/system';

interface CentralInfoRowProps {
  data: ChecklistRowDataConfigurationLan;
  onChange: (change: {
    field: string;
    value: string | number | boolean;
    type: 'float' | 'integer' | 'string' | 'boolean';
  }) => void;
  readOnly: boolean;
}
const ConfigurationLanRow: React.FC<CentralInfoRowProps> = ({ data, onChange, readOnly }) => {
  const {
    serialNumber,
    internalIp,
    externalIp,
    ports,
    username,
    password,
    peerToPeer,
    peerToPeerNotes,
    snmpVersion,
    ping,
    ddnsServer,
    ddnsUsername,
    ddnsPassword,
    notes,
  } = data;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="IP Interno"
          value={internalIp ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'internalIp', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="IP Esterno"
          value={externalIp ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'externalIp', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Porte"
          value={ports ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'ports', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Numero Seriale"
          value={serialNumber ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'serialNumber', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <FormControl fullWidth>
          <FormLabel id="snmp-version-label">Versione SNMP</FormLabel>
          <RadioGroup
            aria-labelledby="snmp-version-label"
            name="snmp-version-group"
            value={snmpVersion ?? ''}
            row
            onChange={(ev, value) => onChange({ field: 'snmpVersion', value, type: 'string' })}
          >
            <FormControlLabel value={ChecklistSnmpVersionEnum.V1} control={<Radio />} sx={{ flex: 1 }} label="V1" />
            <FormControlLabel value={ChecklistSnmpVersionEnum.V2} control={<Radio />} sx={{ flex: 1 }} label="V2" />
            <FormControlLabel value={ChecklistSnmpVersionEnum.V3} control={<Radio />} sx={{ flex: 1 }} label="V3" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <FormControl fullWidth>
          <FormLabel id="p2p-label">Peer-to-Peer</FormLabel>
          <Stack direction="row" spacing={2} alignItems="center">
            <Checkbox
              value={peerToPeer}
              onChange={(ev) => onChange({ field: 'peerToPeer', value: ev.target.checked, type: 'boolean' })}
            />
            <TextField
              value={peerToPeerNotes ?? ''}
              fullWidth
              type="text"
              onChange={(ev) => onChange({ field: 'peerToPeerNotes', value: ev.target.value, type: 'string' })}
              slotProps={{ input: { readOnly } }}
            />
          </Stack>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Nome utente"
          value={username ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'username', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Password"
          value={password ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'password', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="DDNS Server"
          value={ddnsServer ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'ddnsServer', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="DDNS Nome utente"
          value={ddnsUsername ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'ddnsUsername', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="DDNS Password"
          value={ddnsPassword ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'ddnsPassword', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Ping"
          value={ping ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'ping', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <TextField
          label="Note"
          value={notes || ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'notes', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
    </Grid>
  );
};

export default ConfigurationLanRow;
