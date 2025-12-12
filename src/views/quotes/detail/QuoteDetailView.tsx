import { Accordion, AccordionDetails, AccordionSummary, Chip, Divider, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import { useQuoteById } from '~/proxies/aries-proxy/quotes';
import { RouteConfig } from '~/routes/routeConfig';

const QuoteDetailView = () => {
  const params = useParams<{ year?: string; quoteId?: string }>();
  const year = Number(params.year);
  const quoteId = Number(params.quoteId);

  const quoteQuery = useQuoteById(year, quoteId, {
    includes: 'revisions,revisions.customer,revisions.destination,revisions.lots,revisions.lots.items',
  });

  const quote = quoteQuery.data?.quotes.at(0);

  return (
    <SplitLayout>
      <SplitMain>
        <PageContainer>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">
                Preventivo #{quoteId} / {year}
              </Typography>
              <Typography
                component={RouterLink}
                to={RouteConfig.QuoteList.buildLink()}
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                {'←'} Torna alla lista
              </Typography>
            </Stack>

            {quote && (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Chip label={`Stato: ${quote.status?.name ?? quote.statusId ?? 'N/D'}`} />
                  <Chip label={`Tipo: ${quote.quoteType?.name ?? quote.quoteTypeId}`} />
                  <Chip label={`Revisione corrente: ${quote.revisionId ?? 'N/D'}`} />
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  {quote.note || 'Nessuna nota'}
                </Typography>

                <Divider />

                <Typography variant="h6">Revisioni</Typography>
                {(quote.revisions ?? []).map((rev) => (
                  <Accordion key={`${rev.year}-${rev.id}`} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle1">
                          Rev. {rev.id} ({rev.revisionDate ?? 'data n/d'})
                        </Typography>
                        <Chip label={`Cliente: ${rev.customer?.companyName ?? 'N/D'}`} size="small" />
                        <Chip
                          label={
                            rev.destination
                              ? `Destinazione: ${rev.destination.municipality} ${rev.destination.province ?? ''}`.trim()
                              : 'Destinazione: N/D'
                          }
                          size="small"
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          {rev.note || 'Nessuna nota'}
                        </Typography>
                        <Typography variant="subtitle2">Lotti</Typography>
                        {(rev.lots ?? []).map((lot) => (
                          <Stack
                            key={lot.position}
                            spacing={1}
                            sx={{ border: '1px solid #eee', borderRadius: 1, p: 2 }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="body1">Lotto #{lot.position}</Typography>
                              <Chip label={`Id lotto: ${lot.lotId}`} size="small" />
                              {lot.optional && <Chip label="Opzionale" color="warning" size="small" />}
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {lot.note || 'Nessuna nota'}
                            </Typography>
                            <Typography variant="subtitle2">Articoli</Typography>
                            {(lot.items ?? []).map((item) => (
                              <Stack
                                key={item.tabId}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ borderBottom: '1px dashed #eee', pb: 1 }}
                              >
                                <Typography variant="body2">
                                  [{item.tabId}] {item.articleId ?? 'N/D'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.shortDescription ?? ''}
                                </Typography>
                                <Chip label={`Q.tà ${item.quantity ?? 0}`} size="small" />
                                <Chip label={`Prezzo ${item.price ?? 0}`} size="small" />
                              </Stack>
                            ))}
                            {(!lot.items || lot.items.length === 0) && (
                              <Typography variant="body2" color="text.secondary">
                                Nessun articolo presente.
                              </Typography>
                            )}
                          </Stack>
                        ))}
                        {(!rev.lots || rev.lots.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            Nessun lotto presente.
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Stack>
        </PageContainer>
      </SplitMain>
    </SplitLayout>
  );
};

export default QuoteDetailView;
