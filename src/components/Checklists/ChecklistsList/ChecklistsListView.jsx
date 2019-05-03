import React from 'react'
import PropTypes from 'prop-types'
import {Table} from 'semantic-ui-react'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {map} from 'ramda'
import ChecklistListRow from '../ChecklistsListRow'
import { Dimmer, Loader } from '../../UI'

const messages = defineMessages({
  id: {id: 'ID'},
  date: {id: 'DATE'},
  companyName: {id: 'COMPANY_NAME'},
  type: {id: 'TYPE'},
  description: {id: 'DESCRIPTION'}
})

const ChecklistList = ({data, intl, isLoading}) => {

  const {formatMessage} = intl;
  const {list} = data;
  return (
    <div>
      <Dimmer inverted active={isLoading}>
        <Loader inverted />
      </Dimmer>
      <Table striped selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{formatMessage(messages.id)}</Table.HeaderCell>
            <Table.HeaderCell>{formatMessage(messages.date)}</Table.HeaderCell>
            <Table.HeaderCell>{formatMessage(messages.companyName)}</Table.HeaderCell>
            <Table.HeaderCell>{formatMessage(messages.description)}</Table.HeaderCell>
            <Table.HeaderCell>{formatMessage(messages.type)}</Table.HeaderCell>
            <Table.HeaderCell>{formatMessage(messages.type)}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body> 
          {map((item) => (
            <ChecklistListRow key={'checklist_' + item.id} data={item}/>
          ), list)}
        </Table.Body>
      </Table>
    </div>
  )
};

// PropTypes
ChecklistList.propTypes = {
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
};


export default injectIntl(ChecklistList);