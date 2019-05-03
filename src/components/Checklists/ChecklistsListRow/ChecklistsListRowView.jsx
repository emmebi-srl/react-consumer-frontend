import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import {withRouter} from 'react-router-dom'
import AriesDate from '../../UI/AriesDate'


const ChecklistListRow = ({data, history, match}) => {
  return (
    <Table.Row onClick={_ =>  history.push(`${match.url}/${data.id}`)}>
        <Table.Cell>{data.id}</Table.Cell>
        <Table.Cell>
            <AriesDate unixTimestamp={data.executionDate}/>
        </Table.Cell>
        <Table.Cell>{data.customer.companyName}</Table.Cell>
        <Table.Cell>{data.system.description}</Table.Cell>
        <Table.Cell>{data.checklistType}</Table.Cell>
    </Table.Row>
  )
};

// PropTypes
ChecklistListRow.propTypes = {
  data: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};


export default withRouter(ChecklistListRow);