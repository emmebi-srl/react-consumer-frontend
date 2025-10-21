import React from 'react';
import { getMomentByUnixtimestamp, getStringDateByUnixtimestamp } from '../../../../utils/datetime-utils';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Work, WorkTypeEnum } from '~/types/aries-proxy/works';
import { Stack } from '@mui/system';
import { formatLocaleNumber } from '~/utils/number-utils';
import { ArrowDropDown } from '@mui/icons-material';
import { getMonthName } from '~/utils/months-utils';
import { getMonth } from 'date-fns';

const SearchItemList: React.FC<{
  work: Work;
  isEven: boolean;
}> = ({ work, isEven }) => {
  const [open, setOpen] = React.useState(false);

  const maintenance = work.items.find((el) => el.workType === WorkTypeEnum.Maintenance);
  const tickets = work.items.filter((el) => el.workType === WorkTypeEnum.Ticket);

  const maintenanceDate = maintenance?.expirationDate
    ? getMomentByUnixtimestamp({ unixTimestamp: maintenance.expirationDate })
    : null;

  const bgcolor = isEven ? 'background.paper' : 'grey.100';
  return (
    <>
      <ListItem key={work.systemId} sx={{ flexDirection: 'column', width: '100%', bgcolor }}>
        <Accordion expanded={open} sx={{ boxShadow: 'none', width: '100%', bgcolor }}>
          <AccordionSummary>
            <Stack direction="row" alignItems="center" width="100%" gap={1}>
              <Stack direction="column" flex={1}>
                <Typography variant="body1">
                  {work.customerId} - {work.companyName}
                </Typography>
                <Typography variant="body2">
                  {work.systemId} - {work.systemType} - {work.systemDescription}
                </Typography>
                <Typography variant="body2">
                  {work.destination.municipality} ({work.destination.province}) - {work.destination.postalCode} -{' '}
                  {work.destination.street} {work.destination.houseNumber}
                </Typography>
              </Stack>
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="body2">
                  Distanza
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {formatLocaleNumber({ value: work.distance, radix: 2 })}
                    km
                  </span>
                </Typography>
                {maintenance ? (
                  <Typography color="error.main" variant="body2">
                    Controllo Periodico
                  </Typography>
                ) : null}
                {tickets[0] ? (
                  <Typography variant="body2">
                    Ticket:
                    <span style={{ fontWeight: 600 }}> {tickets.length}</span>
                  </Typography>
                ) : null}
              </Stack>
              <IconButton onClick={() => setOpen(!open)}>
                <ArrowDropDown
                  fontSize="large"
                  color="primary"
                  sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}
                />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tipo Lavoro</TableCell>
                  <TableCell>Descrizione</TableCell>
                  <TableCell>Data scadenza</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {maintenance ? (
                  <TableRow key={maintenance.referenceId}>
                    <TableCell>{maintenance.referenceId}</TableCell>
                    <TableCell>Controllo periodico</TableCell>
                    <TableCell>
                      {maintenance.description}
                      {maintenanceDate ? (
                        <>
                          {' '}
                          - {getMonthName(getMonth(maintenanceDate.toDate()))} {maintenanceDate.year()}
                        </>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {maintenance.expirationDate
                        ? getStringDateByUnixtimestamp({ unixTimestamp: maintenance.expirationDate })
                        : null}
                    </TableCell>
                  </TableRow>
                ) : null}
                {tickets.map((ticket) => (
                  <TableRow key={ticket.referenceId}>
                    <TableCell>{ticket.referenceId}</TableCell>
                    <TableCell>Ticket</TableCell>
                    <TableCell>{ticket.description}</TableCell>
                    <TableCell>
                      {ticket.expirationDate
                        ? getStringDateByUnixtimestamp({ unixTimestamp: ticket.expirationDate })
                        : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      </ListItem>

      <Divider component="li" />
    </>
  );
};

const SearchList: React.FC<{
  data?: Work[];
}> = ({ data }) => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" gutterBottom>
        Lista risultati
      </Typography>
      {data?.[0] ? (
        <List>
          {data.map((result, index) => {
            return <SearchItemList key={result.systemId} work={result} isEven={index % 2 === 0} />;
          })}
        </List>
      ) : (
        <Typography>Nessun dato disponibile</Typography>
      )}
    </Box>
  );
};

export default SearchList;
