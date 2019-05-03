import React from 'react'
import PropTypes from 'prop-types'
import {injectIntl, intlShape} from 'react-intl'
import ActionsBar from '../../../ActionsBar';
import {createRightButton} from '../../../ActionsBar/ActionsBarView';
import {ICON_EDIT_REF, ICON_SAVE_REF} from '../.././../../consts'
import ConfirmationModal from '../../../Modals/ConfirmationModal';


const ChecklistActionsBarView = ({intl, startEditing, editMode, hasChecklistLink, 
  checklist, createSystemChecklistAssoc, updateChecklist, cancelUpdate}) => {

  const {formatMessage} = intl;
  const rightButtons = [];
  if(editMode) {
    rightButtons.push(createRightButton({
      ref: 'save', 
      caption: formatMessage({id: 'SAVE'}), 
      isLoading: true, 
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
      isLoading: true,
      ButtonWrapper: ({button}) => <ConfirmationModal 
        MyButton={button}
        title={formatMessage({id: 'SYSTEM_CHECKLIST_ASSOCIATION'})}
        text={formatMessage({id: hasChecklistLink ? 'ATTENTION_SYSTEM_ALREADY_LINK_TO_CHECKLIST_REPLACE' : 'DO_YOU_WANT_CRATE_SYSTEM_CHECKLIST_ASSOCIATION'})}
        onClick={(value) => value && createSystemChecklistAssoc(checklist.id)}
      />, 
    }));
    rightButtons.push(createRightButton({
      ref: 'edit', 
      caption: formatMessage({id: 'EDIT'}), 
      onClick: () => startEditing(), 
      isLoading: true, 
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