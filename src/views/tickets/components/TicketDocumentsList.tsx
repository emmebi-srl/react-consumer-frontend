import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { RouteConfig } from '~/routes/routeConfig';
import { TicketDocument } from '~/types/aries-proxy/tickets';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

const documentLabel = (document: TicketDocument) =>
  document.type === 'report'
    ? `Rapporto ${document.number || document.id}/${document.year}`
    : `Preventivo ${document.id}/${document.year}`;

const documentLink = (document: TicketDocument) =>
  document.type === 'report'
    ? RouteConfig.ReportEdit.buildLink({ year: String(document.year), reportId: String(document.id) })
    : RouteConfig.QuoteDetail.buildLink({ year: String(document.year), quoteId: String(document.id) });

/** Reports and quotes linked to the ticket: the "Documenti" grid of the Delphi screen. */
const TicketDocumentsList: React.FC<{ documents: TicketDocument[] }> = ({ documents }) => {
  if (!documents.length)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nessun documento collegato
      </Typography>
    );
  return (
    <Stack spacing={1.5}>
      {documents.map((document) => (
        <Box key={`${document.type}-${document.year}-${document.id}`}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Link component={RouterLink} to={documentLink(document)} variant="body2" sx={{ fontWeight: 600 }}>
              {documentLabel(document)}
            </Link>
            {document.date ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {getStringDateByUnixtimestamp(document.date)}
              </Typography>
            ) : null}
            {document.type === 'report' && document.isCompleted != null ? (
              <Chip
                size="small"
                variant="outlined"
                color={document.isCompleted ? 'success' : 'warning'}
                label={document.isCompleted ? 'Terminato' : 'Non terminato'}
              />
            ) : null}
          </Stack>
          {document.description ? (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
              }}
            >
              {document.description}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
};

export default TicketDocumentsList;
