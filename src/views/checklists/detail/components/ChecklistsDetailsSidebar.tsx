import React from 'react';
import { List, ListItem } from '@mui/material';
import { ChecklistParagraph } from '~/types/aries-proxy/checklists';
import { useActiveGeneralInfo, useActiveParagraphIndex } from '../state';

interface ChecklistsDetailsSidebarProps {
  paragraphs: ChecklistParagraph[];
}
const ChecklistsDetailsSidebar: React.FC<ChecklistsDetailsSidebarProps> = (props) => {
  const [activeParagraphIndex, changeActiveParagraph] = useActiveParagraphIndex();
  const [isGeneralInfoActive, setGeneralInfoActive] = useActiveGeneralInfo();
  const { paragraphs } = props;

  return (
    <List>
      <ListItem
        sx={{
          color: isGeneralInfoActive ? 'primary.main' : 'text.primary',
          bgcolor: isGeneralInfoActive ? 'white' : 'inherit',
          borderBottom: '1px solid',
          borderTop: '1px solid',
          borderColor: (theme) => theme.palette.divider,
          cursor: 'pointer',
        }}
        onClick={() => {
          changeActiveParagraph(null);
          setGeneralInfoActive(true);
        }}
      >
        Info generali
      </ListItem>
      {paragraphs.map((paragraph, index) => {
        return (
          <ListItem
            key={`checklist_paragraph_sidebar_${index}`}
            sx={{
              color: activeParagraphIndex === index ? 'primary.main' : 'text.primary',
              bgcolor: activeParagraphIndex === index ? 'white' : 'inherit',
              borderBottom: '1px solid',
              borderColor: (theme) => theme.palette.divider,
              cursor: 'pointer',
            }}
            onClick={() => {
              changeActiveParagraph(index);
              setGeneralInfoActive(false);
            }}
          >
            {paragraph.name}
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChecklistsDetailsSidebar;
