import _isNumber from 'lodash/isNumber';
import { useParams } from 'react-router-dom';
import { useChecklistById } from '~/proxies/aries-proxy/checklists';
import PageContainer from '~/components/Layout/PageContainer';
import { Alert, Box, Stack, Typography } from '@mui/material';
import ChecklistActionsBar from './components/ChecklistActionsBar';
import ChecklistsDetailsSidebar from './components/ChecklistsDetailsSidebar';
import ChecklistsDetailsGeneral from './components/ChecklistsDetailsGeneral/ChecklistsDetailsGeneral';
import { useActiveGeneralInfo, useActiveParagraphIndex } from './state';
import { isDefined } from '~/types/typeGuards';
import ChecklistsDetailsParagraph from './components/ChecklistsDetailsParagraph';

const ChecklistDetailView = () => {
  const params = useParams<{ checklistId: string }>();
  const [generalInfoActive] = useActiveGeneralInfo();
  const [paragraphIndex] = useActiveParagraphIndex();

  const checklistId = Number(params.checklistId);
  if (!checklistId || !_isNumber(checklistId)) {
    throw new Error('Checklist ID is required and must be a number');
  }
  const checklistQuery = useChecklistById(checklistId);

  if (checklistQuery.isLoading) {
    return (
      <PageContainer>
        <Typography>Loading...</Typography>
      </PageContainer>
    );
  }

  const checklist = checklistQuery.data?.list[0];
  if (!checklist) {
    return (
      <PageContainer>
        <Alert severity="error">Checklist not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer sx={{ overflow: 'hidden', height: '100%' }}>
      <Stack
        spacing={3}
        direction="column"
        flexGrow={1}
        sx={{
          height: '100%',
        }}
      >
        <ChecklistActionsBar checklist={checklist} />
        <Stack
          direction="row"
          spacing={2}
          flexGrow={1}
          sx={{
            height: '100%',
          }}
        >
          <Box
            sx={{
              height: '100%',
              overflowY: 'scroll',
              maxWidth: '400px',
              minWidth: '350px',
              borderRight: '1px solid',
              borderColor: (theme) => theme.palette.divider,
              bgcolor: (theme) => theme.palette.grey[100],
            }}
          >
            <ChecklistsDetailsSidebar paragraphs={checklist.paragraphs ?? []} />
          </Box>
          <Box
            sx={{
              height: '100%',
              overflowY: 'scroll',
              flexGrow: 1,
              pb: 6,
            }}
          >
            {generalInfoActive ? <ChecklistsDetailsGeneral checklist={checklist} /> : null}
            {isDefined(paragraphIndex) && checklist.paragraphs?.[paragraphIndex] ? (
              <ChecklistsDetailsParagraph data={checklist.paragraphs[paragraphIndex]} paragraphIndex={paragraphIndex} />
            ) : null}
          </Box>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default ChecklistDetailView;
