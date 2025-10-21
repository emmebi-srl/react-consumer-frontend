import React from 'react'
import PropTypes from 'prop-types'
import { LightGrey, DarkGrey, VeryLightGrey, LightBlue } from '../../../../styles';
import styled, { css } from '@mui/system';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

const messages = defineMessages({
  generalInfo: { id: 'GENERAL_INFO' },
})

const ListContainer = /* TODO: interpolation requires manual refactor */
styled('ul')(() => ({ /* FIXME convert from template */
border: 1px solid ${LightGrey};
  list-style: none;
  background-color: transparent;
  box-shadow: 0 1px 1px rgba(255,255,255,0.95);
  overflow: hidden;
  margin: 0px;
  padding: 0px;
}));

export const ListItem = /* TODO: interpolation requires manual refactor */
styled('li')(() => ({ /* FIXME convert from template */
display: block;
  border-bottom: 1px solid  ${LightGrey};
  color: ${DarkGrey};
  padding: 19px 10px;
  box-shadow: 0 1px 1px rgba(255,255,255,0.95);
  background: ${VeryLightGrey};
  transition: color 0.25s ease,background-color 0.25s ease,border-color 0.25s ease,box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    background: white;
  }

  ${props => props.active && css
}))
    background: white;
    color: ${LightBlue};
  `}
`;

class ChecklistsDetailsSidebar extends React.Component {

  render() {
    const {
      paragraphs,
      changeActiveParagraph,
      activeGeneralInfo,
      isGeneralInfoActive,
      activeParagraphIndex,
      intl: { formatMessage }} = this.props;

    return (
      <ListContainer>
        <ListItem
          active={isGeneralInfoActive}
          onClick={() => activeGeneralInfo({value: false})}>
          {`${formatMessage(messages.generalInfo)}`}</ListItem>
        {paragraphs.map((paragraph, index)=> {
          return <ListItem
            active={activeParagraphIndex === index}
            key={`checklist_paragraph_${index}`}
            onClick={() => changeActiveParagraph({ paragraphIndex: index })}>
          {`${paragraph.name}` }</ListItem>
        })}
      </ListContainer>
    )
  }
};

// PropTypes
ChecklistsDetailsSidebar.propTypes = {
  paragraphs: PropTypes.array.isRequired,
  changeActiveParagraph: PropTypes.func.isRequired,
  activeGeneralInfo: PropTypes.func.isRequired,
  isGeneralInfoActive: PropTypes.bool.isRequired,
  activeParagraphIndex: PropTypes.number,
  intl: intlShape.isRequired,
};

export default injectIntl(ChecklistsDetailsSidebar);

