import { TableCell } from '@mui/material';
import DetailDataCell from '~/components/Table/DetailDataCell';
import LabelWithTooltip from '~/components/Table/LabelWithTooltip';
import { MainLabel } from '~/components/Table/TableLabels';
import { Customer } from '~/types/aries-proxy/customers';

interface Props {
  customer: Customer;
}

const CustomerTableRowContent: React.FC<Props> = ({ customer }) => {
  return (
    <>
      <TableCell align="left">
        <MainLabel>{customer.id}</MainLabel>
      </TableCell>
      <TableCell sx={{ width: '100%', maxWidth: 0 }}>
        <DetailDataCell
          sx={{
            overflow: 'hidden',
          }}
        >
          <LabelWithTooltip label={customer.companyName} />
        </DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <MainLabel>{customer.taxCode}</MainLabel>
      </TableCell>

      <TableCell align="left">
        <MainLabel>{customer.vat}</MainLabel>
      </TableCell>
    </>
  );
};

export default CustomerTableRowContent;
