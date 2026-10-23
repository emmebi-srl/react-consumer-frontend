import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import BackButton from '~/components/Layout/BackButton';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useChargePrices, usePriceChargeAnomalies } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { buildProductDetailLink } from '../productHelpers';

interface BandForm {
  fromCost: number;
  toCost: number;
  percentage: number;
}

const formatAmount = (value: number) =>
  value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The next band starts one cent after the previous one, like the Delphi form.
const nextBand = (previous?: BandForm): BandForm => {
  const start = previous ? Math.round((previous.toCost + 0.01) * 100) / 100 : 0;
  return { fromCost: start, toCost: start, percentage: 0 };
};

const validateBands = (bands: BandForm[]) => {
  for (const [index, band] of bands.entries()) {
    if (band.toCost < band.fromCost) return `Fascia ${index + 1}: l'importo finale è minore di quello iniziale.`;
    const previous = bands[index - 1];
    if (previous && band.fromCost <= previous.toCost) return `La fascia ${index + 1} si sovrappone alla precedente.`;
  }
  return null;
};

// "Gestione ricarico" of the Delphi client (UFProductPriceCharge): for every product whose internal cost
// is within a band, internal price = cost + percentage. It applies to the whole catalogue.
const ProductPriceChargeView = () => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const chargeMutation = useChargePrices();
  const [bands, setBands] = useState<BandForm[]>([nextBand()]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [skipZeroCost, setSkipZeroCost] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const anomaliesQuery = usePriceChargeAnomalies(onlyActive, true);
  const anomalies = anomaliesQuery.data ?? [];
  const bandsError = validateBands(bands);

  const updateBand = (index: number, field: keyof BandForm, value: string) =>
    setBands((current) =>
      current.map((band, bandIndex) =>
        bandIndex === index ? { ...band, [field]: value === '' ? 0 : Number(value) } : band,
      ),
    );

  const charge = async () => {
    if (bandsError) return;

    if (anomalies.length > 0) {
      const warning = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Articoli con anomalie',
          text: `Attenzione, sono presenti ${anomalies.length} articoli con costo a zero. Continuare?`,
          alertSeverity: 'warning',
        },
      });
      if (warning.action !== 'YES') return;
    }

    const confirm = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Effettua ricarico',
        text: "Sei sicuro di voler continuare con il ricarico? L'operazione è irreversibile e aggiorna il prezzo interno di tutti gli articoli nelle fasce indicate.",
        alertSeverity: 'error',
      },
    });
    if (confirm.action !== 'YES') return;

    try {
      const result = await chargeMutation.mutateAsync({ bands, onlyActive, skipZeroCost });
      snackbar.success(`Ricarico effettuato: ${result.updatedPrices} prezzi aggiornati`);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile effettuare il ricarico'));
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <BackButton to={RouteConfig.ProductList.buildLink()} />
          <Typography variant="h4">Ricarico prezzi</Typography>
        </Stack>

        <Alert severity="info">
          Per ogni fascia, agli articoli con costo interno compreso tra importo iniziale e finale viene impostato il
          prezzo interno = costo + percentuale di ricarico. Vengono aggiornati solo gli articoli che hanno già un prezzo
          interno.
        </Alert>

        <Card variant="outlined">
          <CardHeader
            title="Fasce"
            slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }}
            action={
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setBands((current) => [...current, nextBand(current.at(-1))])}
              >
                Aggiungi fascia
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              {bands.map((band, index) => (
                <Stack key={index} direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ width: 80, fontWeight: 600 }}>{index + 1}° fascia</Typography>
                  <TextField
                    size="small"
                    type="number"
                    label="Importo iniziale (€)"
                    value={band.fromCost}
                    onChange={(e) => updateBand(index, 'fromCost', e.target.value)}
                    slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Importo finale (€)"
                    value={band.toCost}
                    onChange={(e) => updateBand(index, 'toCost', e.target.value)}
                    slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Ricarico (%)"
                    value={band.percentage}
                    onChange={(e) => updateBand(index, 'percentage', e.target.value)}
                    slotProps={{ htmlInput: { step: '0.01' } }}
                  />
                  <IconButton
                    size="small"
                    disabled={bands.length === 1}
                    onClick={() => setBands((current) => current.filter((_band, bandIndex) => bandIndex !== index))}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              {bandsError && <Alert severity="error">{bandsError}</Alert>}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox checked={skipZeroCost} onChange={(e) => setSkipZeroCost(e.target.checked)} />}
            label="Non ricaricare articoli con costo zero"
          />
          <FormControlLabel
            control={<Checkbox checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />}
            label="Ricarica solo articoli attivi"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" disabled={!!bandsError || chargeMutation.isPending} onClick={charge}>
            {chargeMutation.isPending ? 'Ricarico in corso…' : 'Effettua ricarico'}
          </Button>
          <Button variant="outlined" color="warning" onClick={() => setShowAnomalies((current) => !current)}>
            {showAnomalies ? 'Nascondi anomalie' : `Visualizza anomalie (${anomalies.length})`}
          </Button>
        </Stack>

        {showAnomalies && (
          <Card variant="outlined">
            <CardHeader
              title="Articoli con costo a zero"
              subheader={onlyActive ? 'Solo articoli attivi' : 'Tutti gli articoli'}
              slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }}
            />
            <CardContent sx={{ pt: 0 }}>
              {anomalies.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Nessuna anomalia
                </Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Codice</TableCell>
                        <TableCell>Cod. fornitore</TableCell>
                        <TableCell>Descrizione</TableCell>
                        <TableCell align="right">Costo</TableCell>
                        <TableCell align="right">Prezzo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {anomalies.map((anomaly) => (
                        <TableRow key={anomaly.productCode}>
                          <TableCell>
                            <RouterLink to={buildProductDetailLink(anomaly.productCode)}>
                              {anomaly.productCode}
                            </RouterLink>
                          </TableCell>
                          <TableCell>{anomaly.supplierProductCode || '—'}</TableCell>
                          <TableCell>{anomaly.description || '—'}</TableCell>
                          <TableCell align="right">{formatAmount(anomaly.cost)}</TableCell>
                          <TableCell align="right">{formatAmount(anomaly.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </PageContainer>
  );
};

export default ProductPriceChargeView;
