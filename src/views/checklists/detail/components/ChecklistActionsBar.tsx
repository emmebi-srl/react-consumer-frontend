import { useChecklistPdf, useCreateChecklistSystemLink } from '~/proxies/aries-proxy/checklists';
import { Checklist } from '~/types/aries-proxy/checklists';
import { useEditMode } from '../state';
import { useModal } from '~/modals/Modal';
import ActionsBar from '~/components/Layout/ActionsBar';
import { Button } from '@mui/material';
import { DatasetLinked, Edit, PictureAsPdf, Save } from '@mui/icons-material';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';

const ChecklistActionsBar: React.FC<{ checklist: Checklist }> = ({ checklist }) => {
  const [editMode, setEditMode] = useEditMode();
  const modal = useModal();
  const checklistPdf = useChecklistPdf();
  const linkToSystem = useCreateChecklistSystemLink();
  const snackbar = useSnackbar();

  const getChecklistPdf = () => {
    checklistPdf.mutate(
      { checklistId: checklist.id },
      {
        onError: () => {
          snackbar.error('Errore durante il recupero del PDF della checklist.');
        },
      },
    );
  };

  const createModelLinkToSystem = () => {
    linkToSystem.mutate(
      { checklistId: checklist.id },
      {
        onSuccess: () => {
          snackbar.success('Associazione completata con successo.');
        },
        onError: () => {
          snackbar.error('Errore durante la creazione del link al sistema.');
        },
      },
    );
  };

  const onSaveClick = async () => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Salva checklist',
        text: 'Sei sicuro di voler salvare le modifiche apportate alla checklist?',
      },
    });
    if (result.action === 'YES') {
      throw new Error('Not implemented yet');
    }
  };

  if (editMode) {
    return (
      <ActionsBar>
        <Button endIcon={<Save />} variant="outlined" onClick={() => setEditMode(false)}>
          Annulla
        </Button>
        <Button endIcon={<Save />} variant="contained" color="primary" onClick={onSaveClick}>
          Salva
        </Button>
      </ActionsBar>
    );
  } else {
    return (
      <ActionsBar>
        <Button endIcon={<DatasetLinked />} variant="outlined" onClick={createModelLinkToSystem}>
          Associa impianto
        </Button>

        <Button endIcon={<PictureAsPdf />} variant="outlined" onClick={getChecklistPdf}>
          Visualizza PDF
        </Button>

        <Button endIcon={<Edit />} variant="contained" color="primary" onClick={() => setEditMode(true)}>
          Modifica
        </Button>
      </ActionsBar>
    );
  }
};

export default ChecklistActionsBar;
