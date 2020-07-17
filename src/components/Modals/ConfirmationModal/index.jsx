import React from 'react'
import { Button, Modal } from '../../UI'
import styled from '../../../../node_modules/styled-components'
import { CenterVerticallyRelative } from '../../../styles'
import { injectIntl, defineMessages } from 'react-intl'

const ModalWrapper = styled(Modal)`
  margin: 0 auto!important;
  ${CenterVerticallyRelative}
`

const messages = defineMessages({
  yes: { id: 'YES' },
  no: { id: 'NO' },
})

class ConfirmationModal extends React.Component {
  state = { open: false }

  closeConfigShow = (closeOnEscape, closeOnDimmerClick) => () => {
    this.setState({ closeOnEscape, closeOnDimmerClick, open: true })
  }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  render () {
    const {intl, MyButton, title, text, onClick} = this.props;
    const {formatMessage} = intl;
    const {open} = this.state;

    const clickHandler = (value) => {
      return Promise.resolve()
        .then(_ => onClick(value))
        .then(_ => this.close())
        .catch((err) => console.log('Error', err))
    }

    return (<span>
      <MyButton wrapperClick={this.open}/>

      <ModalWrapper
        open={open}
        closeOnEscape={false}
        closeOnDimmerClick={true}
        onClose={this.close}
      >
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <p>{text}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button 
            onClick={() => clickHandler(false)}
            negative>
            {formatMessage(messages.no)}
          </Button>
          <Button
            onClick={() => clickHandler(true)}
            positive
            labelPosition='right'
            icon='checkmark'
            content={formatMessage(messages.yes)}
          />
        </Modal.Actions>
      </ModalWrapper>
    
    </span>);
  }
}

export default injectIntl(ConfirmationModal)