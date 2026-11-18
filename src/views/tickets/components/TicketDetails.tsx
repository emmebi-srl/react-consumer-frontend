import { Box, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import { useTicketCustomerMainContact } from '~/proxies/aries-proxy/tickets';
import { RouteConfig } from '~/routes/routeConfig';
import { Ticket, TICKET_SENT_TYPE_LABELS, TicketSentType } from '~/types/aries-proxy/tickets';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import {
  formatDestination,
  formatWorkHours,
  getUrgencyColor,
  getUrgencyLabel,
  isTicketExpired,
} from '../ticketHelpers';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { AriesModule } from '~/types/aries-proxy/users';
import TicketAttachmentsList from './TicketAttachmentsList';
import TicketDocumentsList from './TicketDocumentsList';
import TicketEventsList from './TicketEventsList';
import TicketSystemConditions from './TicketSystemConditions';

const DetailRow: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({
  label,
  value,
  fullWidth,
}) => (
  <Box sx={{ minWidth: 0, gridColumn: fullWidth ? '1 / -1' : undefined }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const DetailGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>{children}</Box>
);

const formatDate = (unix?: number | null) => (unix ? getStringDateByUnixtimestamp(unix) : '');

/** Read-only summary of a ticket: the boxes of the Delphi screen (customer, system, ticket, documents, attachment). */
const TicketDetails: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const { data: contact } = useTicketCustomerMainContact(ticket.customerId);
  const { permission } = useModulePermission(AriesModule.Tickets);
  const expired = isTicketExpired(ticket, ticket.status?.isOpen ?? true);
  const sentType = ticket.sentTypeId ?? TicketSentType.None;
  const phones = [contact?.phone, contact?.mobilePhone].filter(Boolean).join(' · ');

  return (
    <>
      <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
        <DelphiColorChip label={ticket.status?.name ?? String(ticket.statusId)} delphiColor={ticket.status?.color} />
        <Chip
          size="small"
          variant="outlined"
          color={getUrgencyColor(ticket.urgency)}
          label={`Urgenza ${getUrgencyLabel(ticket.urgency).toLowerCase()}`}
        />
        {expired ? <Chip size="small" color="error" label="Scaduto" /> : null}
        {ticket.printed ? <Chip size="small" color="success" variant="outlined" label="Stampato" /> : null}
        {sentType !== TicketSentType.None ? (
          <Chip size="small" variant="outlined" label={`Inviato: ${TICKET_SENT_TYPE_LABELS[sentType]}`} />
        ) : null}
      </Stack>

      <Typography variant="subtitle2">Cliente</Typography>
      <DetailGrid>
        <DetailRow
          label="Ragione sociale"
          value={
            <Link
              component={RouterLink}
              to={RouteConfig.CustomerDetail.buildLink({ customerId: String(ticket.customerId) })}
            >
              {ticket.customerName ?? `Cliente ${ticket.customerId}`}
            </Link>
          }
        />
        <DetailRow label="Telefono" value={phones} />
        <DetailRow label="Email" value={contact?.email} fullWidth />
      </DetailGrid>

      <Divider />

      <Typography variant="subtitle2">Impianto</Typography>
      <DetailGrid>
        <DetailRow
          label="Impianto"
          value={ticket.systemDescription ?? (ticket.systemId ? `Impianto ${ticket.systemId}` : '')}
        />
        <DetailRow label="Destinazione" value={formatDestination(ticket.destination)} />
      </DetailGrid>
      {ticket.systemConditions ? <TicketSystemConditions conditions={ticket.systemConditions} /> : null}

      <Divider />

      <Typography variant="subtitle2">Ticket</Typography>
      <DetailGrid>
        <DetailRow label="Data ticket" value={formatDate(ticket.ticketDate)} />
        <DetailRow label="Numero" value={ticket.ticketNumber} />
        <DetailRow label="Tipo intervento" value={ticket.interventionType?.name} />
        <DetailRow label="Causale" value={ticket.causal?.name} />
        <DetailRow label="Pervenuta per" value={ticket.requestChannel?.name} />
        <DetailRow
          label="Tempo"
          value={ticket.workMinutes ? `${ticket.workMinutes} min (${formatWorkHours(ticket.workMinutes)})` : ''}
        />
        <DetailRow label="Scadenza" value={formatDate(ticket.expirationDate)} />
        <DetailRow label="Promemoria" value={formatDate(ticket.rememberMeDate)} />
        <DetailRow label="Soluzione" value={formatDate(ticket.solutionDate)} />
        <DetailRow label="Inserito il" value={formatDate(ticket.createdDatetime)} />
        <DetailRow label="Descrizione problema" value={ticket.description} fullWidth />
        <DetailRow
          label="Tag"
          fullWidth
          value={
            ticket.tags?.length ? (
              <Stack direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {ticket.tags.map((tag) => (
                  <Chip key={tag.id} size="small" label={tag.name} />
                ))}
              </Stack>
            ) : null
          }
        />
      </DetailGrid>

      <Divider />

      <Typography variant="subtitle2">Calendario e tecnici</Typography>
      <TicketEventsList events={ticket.events ?? []} />

      <Divider />

      <Typography variant="subtitle2">Documenti</Typography>
      <TicketDocumentsList documents={ticket.documents ?? []} />

      <Divider />

      <Typography variant="subtitle2">Allegati</Typography>
      <TicketAttachmentsList
        ticketId={ticket.id}
        attachments={ticket.attachments ?? []}
        canUpload={!!permission?.canEdit}
      />
    </>
  );
};

export default TicketDetails;
