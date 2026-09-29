import { Button, TableCell } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DetailDataCell from '~/components/Table/DetailDataCell';
import LabelWithTooltip from '~/components/Table/LabelWithTooltip';
import { MainLabel } from '~/components/Table/TableLabels';
import { Customer } from '~/types/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';

interface Props {
  customer: Customer;
}

const CustomerTableRowContent: React.FC<Props> = ({ customer }) => {
  return (
    <>
      <TableCell align="right">
        <MainLabel>{customer.id}</MainLabel>
      </TableCell>
      <TableCell sx={{ width: '100%', maxWidth: 0 }}>
        <DetailDataCell
          sx={{
            overflow: 'hidden',
          }}
        >
          <LabelWithTooltip variant="secondary" label={customer.companyName} />
        </DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{customer.taxCode}</DetailDataCell>
      </TableCell>

      <TableCell align="left">
        <DetailDataCell>{customer.vat}</DetailDataCell>
      </TableCell>
      <TableCell align="right">
        <Button
          component={RouterLink}
          to={RouteConfig.CustomerDetail.buildLink({ customerId: String(customer.id) })}
          size="small"
          variant="outlined"
          onClick={(event) => event.stopPropagation()}
        >
          Dettaglio
        </Button>
      </TableCell>
    </>
  );
};

export default CustomerTableRowContent;
