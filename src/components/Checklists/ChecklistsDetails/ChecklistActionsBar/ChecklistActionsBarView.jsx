import React from 'react'
import PropTypes from 'prop-types'
import {injectIntl, intlShape} from 'react-intl'
import ActionsBar from '../../../ActionsBar';
import {createRightButton} from '../../../ActionsBar/ActionsBarView';
import {ICON_EDIT_REF, ICON_SAVE_REF, ICON_PDF_REF} from '../.././../../consts'
import ConfirmationModal from '../../../Modals/ConfirmationModal';
import { messages } from './messages';
import ariesProxy from '../../../../proxies/aries-proxy'


class ChecklistActionsBarView extends React.Component {

  getChecklistPdf = async () => {
    const { checklist } = this.props;
    const result = await ariesProxy.checklists.getPdf({ id: checklist.id });
    var fileURL = URL.createObjectURL(result.data);
    window.open(fileURL);
  };

  render () {
    const {intl, startEditing, editMode, hasChecklistLink, 
      checklist, createSystemChecklistAssoc, updateChecklist, cancelUpdate} = this.props;
    const {formatMessage} = intl;
    const rightButtons = [];
    if(editMode) {
      rightButtons.push(createRightButton({
        ref: 'save', 
        caption: formatMessage({id: 'SAVE'}), 
        isLoading: false, 
        primary: true, 
        icon: ICON_SAVE_REF, 
        ButtonWrapper: ({button}) => <ConfirmationModal 
          MyButton={button}
          title={formatMessage({id: 'SAVING_CHECKLIST'})}
          text={formatMessage({id: 'DO_YOU_WANT_SAVE_THE_CHECKLIST'})}
          onClick={(value) => value === true ? updateChecklist(checklist.id, checklist) : cancelUpdate(checklist.id, checklist)}
        />, 
      }));
    } else {
      rightButtons.push(createRightButton({
        ref: 'system-association', 
        caption: formatMessage({id: 'ASSOCIATES_SYSTEM'}), 
        isLoading: false,
        ButtonWrapper: ({button}) => <ConfirmationModal 
          MyButton={button}
          title={formatMessage({id: 'SYSTEM_CHECKLIST_ASSOCIATION'})}
          text={formatMessage({id: hasChecklistLink ? 'ATTENTION_SYSTEM_ALREADY_LINK_TO_CHECKLIST_REPLACE' : 'DO_YOU_WANT_CRATE_SYSTEM_CHECKLIST_ASSOCIATION'})}
          onClick={(value) => value && createSystemChecklistAssoc(checklist.id)}
        />, 

      }));

      rightButtons.push(createRightButton({
        ref: 'view-pdf', 
        caption: formatMessage(messages.viewPdf),
        onClick: () => this.getChecklistPdf(checklist.id),
        isLoading: !checklist.isPrinted, 
        icon: ICON_PDF_REF})
      );

      rightButtons.push(createRightButton({
        ref: 'edit', 
        caption: formatMessage(messages.edit), 
        onClick: () => startEditing(), 
        isLoading: false,
        primary: true, 
        icon: ICON_EDIT_REF})
      );
    }

    return (
      <ActionsBar 
        rightButtons={rightButtons}
        />
      
    );
  };
};

// PropTypes
ChecklistActionsBarView.propTypes = {
  intl: intlShape,
  startEditing: PropTypes.func.isRequired, 
  editMode: PropTypes.bool, 
  hasChecklistLink: PropTypes.bool,
  checklist: PropTypes.object, 
  createSystemChecklistAssoc: PropTypes.func.isRequired, 
  updateChecklist: PropTypes.func.isRequired
};


export default injectIntl(ChecklistActionsBarView);