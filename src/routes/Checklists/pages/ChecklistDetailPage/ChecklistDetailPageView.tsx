import React from 'react'
import PropTypes from 'prop-types'
import ChecklistsDetailsSidebar from '../../../../components/Checklists/ChecklistsDetails/ChecklistsDetailsSidebar';
import ChecklistsDetailsGeneral from '../../../../components/Checklists/ChecklistsDetails/ChecklistsDetailsGeneral';
import { Dimmer, Loader } from '../../../../components/UI';
import ChecklistsDetailsParagraph from '../../../../components/Checklists/ChecklistsDetails/ChecklistsDetailsParagraph';
import { FullPageContent } from '../../../../styles';
import ChecklistActionsBar from '../../../../components/Checklists/ChecklistsDetails/ChecklistActionsBar';
import { styled } from '@mui/system';;

const Wrapper = styled('div')({width: 100%;
  height: 100%;});

const SidebarWrapper = styled('div')({height: 100%;
  overflow-y: hidden;
  max-width: 400px;
  float: left;
  width: 100%;});

const ParagraphWrapper = styled('div')({height: 100%;
  overflow-y: hidden;
  width: calc(100% - 400px);
  display: inline-block;});


class ChecklistDetailPageView extends React.Component {
  componentDidMount () {
    const {id} = this.props.match.params;
    this.props.getChecklistDetail(id);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.detail.isLoading !== this.props.detail.isLoading
      || nextProps.detail.activeParagraphIndex !== this.props.detail.activeParagraphIndex;
  }

  render () {
    const { isLoading, activeParagraphIndex, isGeneralInfoActive } = this.props.detail
    if(isLoading) {
      return (
        <Dimmer inverted active={isLoading}>
            <Loader inverted />
        </Dimmer>
      );
    }

    return (
      <FullPageContent>
        <Wrapper>
          <ChecklistActionsBar />
          <SidebarWrapper>
            <ChecklistsDetailsSidebar></ChecklistsDetailsSidebar>
          </SidebarWrapper>
          <ParagraphWrapper>
              {!!isGeneralInfoActive && <ChecklistsDetailsGeneral></ChecklistsDetailsGeneral>}
              {activeParagraphIndex != null && <ChecklistsDetailsParagraph key={`checklist_paragraph_${activeParagraphIndex}`} paragraphIndex={activeParagraphIndex}/>}
          </ParagraphWrapper>
        </Wrapper>
      </FullPageContent>
    )
  }
}

ChecklistDetailPageView.propTypes = {
  detail: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    activeParagraphIndex: PropTypes.number,
  }),
}

export default ChecklistDetailPageView