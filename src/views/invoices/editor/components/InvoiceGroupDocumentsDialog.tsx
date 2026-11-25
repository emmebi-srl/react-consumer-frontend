import { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { InvoiceDocumentKey } from '~/types/aries-proxy/invoices';
import { sameDocument } from '../invoiceFormValues';

export interface GroupableDocument {
  document: InvoiceDocumentKey;
  label: string;
}

interface Props {
  documents: GroupableDocument[];
  onConfirm: (documents: InvoiceDocumentKey[]) => void;
  onClose: () => void;
}

/** TRagruppa of the Delphi editor: the documents whose rows become one "DOCUMENTI RAGRUPPATI" row. */
const InvoiceGroupDocumentsDialog: React.FC<Props> = ({ documents, onConfirm, onClose }) => {
  const [selected, setSelected] = useState<InvoiceDocumentKey[]>([]);
  const toggle = (document: InvoiceDocumentKey, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, document] : current.filter((item) => !sameDocument(item, document)),
    );

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>Raggruppa documenti selezionati</DialogTitle>
      <DialogContent>
        {documents.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nessun documento nelle righe.
          </Typography>
        ) : (
          <Stack>
            {documents.map(({ document, label }) => (
              <FormControlLabel
                key={`${document.type}-${document.year}-${document.id}`}
                label={label}
                control={
                  <Checkbox
                    checked={selected.some((item) => sameDocument(item, document))}
                    onChange={(event) => toggle(document, event.target.checked)}
                  />
                }
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" disabled={!selected.length} onClick={() => onConfirm(selected)}>
          Raggruppa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceGroupDocumentsDialog;
