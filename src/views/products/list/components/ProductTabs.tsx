import { useState } from 'react';
import { Add } from '@mui/icons-material';
import PercentIcon from '@mui/icons-material/Percent';
import PrintIcon from '@mui/icons-material/Print';
import { Button, Stack, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigationTabs, { StateTabData } from '~/components/Layout/NavigationTabs';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { fetchPriceListPdf } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const Container = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Tabs: StateTabData[] = [
  {
    label: 'Tutti',
    key: 'all',
  },
];

// Same header as CustomerTabs, plus the catalogue-wide actions of the Delphi product form.
const ProductTabs: React.FC = () => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const [printing, setPrinting] = useState(false);

  // Like the Delphi "Stampa listino": asks whether to filter out obsolete products, then opens the PDF.
  const printPriceList = async () => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Stampa listino',
        text: 'Si desidera filtrare gli articoli obsoleti?',
        alertSeverity: 'info',
      },
    });
    if (answer.action === 'CLOSE') return;

    // Open the tab synchronously (popup blockers), then point it to the PDF once generated.
    const pdfWindow = window.open('', '_blank');
    setPrinting(true);
    try {
      const url = URL.createObjectURL(await fetchPriceListPdf(answer.action === 'YES'));
      if (pdfWindow) pdfWindow.location.href = url;
      else window.open(url, '_blank');
    } catch (error) {
      pdfWindow?.close();
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile generare il listino'));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Container>
      <NavigationTabs tabs={Tabs} selectedTabKey="all" onSelect={() => {}} />

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<PrintIcon />} disabled={printing} onClick={printPriceList}>
          {printing ? 'Generazione…' : 'Stampa listino'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PercentIcon />}
          component={Link}
          to={RouteConfig.ProductPriceCharge.buildLink()}
        >
          Ricarico prezzi
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          component={Link}
          to={RouteConfig.ProductNew.buildLink()}
        >
          Nuovo articolo
        </Button>
      </Stack>
    </Container>
  );
};

export default ProductTabs;
