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
        sx={{
          flexGrow: 1,
          height: '100%',
        }}
      >
        <ChecklistActionsBar checklist={checklist} />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            flexGrow: 1,
            height: '100%',
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              // On phones the paragraph list goes above the content instead of beside it.
              height: { xs: 'auto', md: '100%' },
              maxHeight: { xs: '35%', md: 'none' },
              flexShrink: 0,
              overflowY: 'auto',
              maxWidth: { xs: 'none', md: '400px' },
              minWidth: { xs: 0, md: '350px' },
              borderRight: { xs: 'none', md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderColor: (theme) => theme.palette.divider,
              bgcolor: (theme) => theme.palette.grey[100],
            }}
          >
            <ChecklistsDetailsSidebar paragraphs={checklist.paragraphs ?? []} />
          </Box>
          <Box
            sx={{
              height: { xs: 'auto', md: '100%' },
              minHeight: 0,
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
