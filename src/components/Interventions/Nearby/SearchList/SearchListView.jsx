import React from 'react';
import PropTypes from 'prop-types';
import { Header, Dimmer, Loader, LocaleNumber, Chevron, Table } from '../../../UI';
import AriesDate from '../../../UI/AriesDate';
import styled, { css } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import SearchListContainer from './SearchListContainer';
import { DarkGrey, LightGrey, Red, media, CenterVertically } from '../../../../styles';
import { getMomentByUnixtimestamp } from '../../../../utils/datetime-utils';
import MonthName from '../../../UI/MonthName';


const Wrapper = styled.div`
  padding: 10px;

  ${media.tablet`
    padding: 10px 20px;
  `}
`;

const ListItem = styled.div`
  position: relative;
  padding: 16px 0;
  display: inline-block;
  width: 100%;
  border-bottom: solid 1px ${LightGrey};

  &:first-child {
    border-top: solid 1px ${LightGrey};
  }
`;

const ListItemRight = styled.div`
  display: inline-block;
  width: 100%;
  text-align: left;
  margin-top: 16px;

  ${media.tablet`
    width: 200px;
    text-align: right;
    margin-top: 0px;
  `}
`;

const ListItemLeft = styled.div`
  float: left;
  width: calc(100% - 50px);

  ${media.tablet`
    width: calc(100% - 265px);
  `}
`;

const CompanyName = styled.div`
  font-size: 16px;
  display: inline-block;
  width: 100%;
  margin-bottom: 8px;
`;
const SystemInfo = styled.div`
  font-size: 14px;
  display: inline-block;
  width: 100%;

  ${media.tablet`
    font-size: 14px;
  `}
`;

const Distance = styled.div`
  font-size: 14px;
  .value {
    font-weight: 600;
  }

  ${media.tablet`
    font-size: 15px;
  `}
`;

const Maintenance = styled(Distance)`
  color: ${Red};
  ${media.tablet`
    margin-top: 5px;
  `}
`;

const Tickets = styled(Distance)`
  ${media.tablet`
    margin-top: 5px;
  `}
`;

const StyledChevron = styled(Chevron)`
  ${media.tablet`
    &:before {
      margin-right: 0px;
    }
  `}
`;

const ChevronContainer = styled.div`
  ${CenterVertically}
  right: 0;

  ${media.tablet`
    cursor: pointer;
    margin-top: 0px;
  `}
`;

const EssentialInfo = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const AdditionalInfo = styled.div`
  max-height: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
  transition: all 0.25s;
  overflow: hidden;

  ${props => props.isOpen && css`
    padding-top: 30px;
    padding-bottom: 10px;
    max-height: 2800px;

    ${media.tablet`
      max-height: 450px;
    `}
  `}
`;

const SearchListView = ({ loading, results, toggleIsOpen }) => {
  return <Wrapper>
    <Header dimension='h3'>
      <FormattedMessage {...messages.resultsList} />
    </Header>
    <Dimmer inverted active={loading}>
      <Loader inverted />
    </Dimmer>
    {
      results[0]
        ? <div>
          {results.map((result) => {
            const { maintenance, tickets = [] } = result.items || {};
            const maintenanceDate = maintenance && maintenance.expirationDate
              ? getMomentByUnixtimestamp({ unixTimestamp: maintenance.expirationDate })
              : null;
            
            return <ListItem key={result.systemId}>
              <EssentialInfo>
                <ListItemLeft>
                  <CompanyName>{result.customerId} - {result.companyName}</CompanyName>
                  <SystemInfo>{result.systemId} - {result.systemType} - {result.systemDescription}</SystemInfo>
                  <SystemInfo>{result.destination.municipality} ({result.destination.province}) - {result.destination.postalCode} -  {result.destination.street} {result.destination.houseNumber}</SystemInfo>
                </ListItemLeft>
                <ListItemRight>
                  <Distance>
                    <FormattedMessage {...messages.distance} />:
                    <span className="value"> <LocaleNumber value={result.distance} radix={2}/>km</span>
                  </Distance>
                  { maintenance ?<Maintenance>
                    <FormattedMessage {...messages.maintenance} />
                  </Maintenance> : null }
                  { tickets[0] ? <Tickets>
                    <FormattedMessage {...messages.ticket} />:
                    <span className="value"> {tickets.length}</span>
                  </Tickets>: null }
                </ListItemRight>
                <ChevronContainer
                    onClick={() => toggleIsOpen({ systemId: result.systemId })}>
                  <StyledChevron size={15}
                    top={0}
                    position={'relative'}
                    direction={result.isOpen ? 'top' : 'right'}
                    hoverColour={LightGrey}
                    fill={DarkGrey}></StyledChevron>
                </ChevronContainer>
              </EssentialInfo>
              <AdditionalInfo isOpen={result.isOpen}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>
                        <FormattedMessage {...messages.id}/>
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        <FormattedMessage {...messages.workType}/>
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        <FormattedMessage {...messages.description}/>
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        <FormattedMessage {...messages.expirationDate}/>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    { maintenance ? <Table.Row key={maintenance.referenceId}>
                        <Table.Cell>{maintenance.referenceId}</Table.Cell>
                        <Table.Cell><FormattedMessage {...messages.maintenance}/></Table.Cell>
                        <Table.Cell>{maintenance.description}{maintenanceDate ? <> - <MonthName mDate={maintenanceDate}/> {maintenanceDate.year()}</> : null }</Table.Cell>
                        <Table.Cell><AriesDate unixTimestamp={maintenance.expirationDate}/></Table.Cell>
                      </Table.Row> : null }
                    { tickets.map((ticket) => (
                      <Table.Row key={ticket.referenceId}>
                        <Table.Cell>{ticket.referenceId}</Table.Cell>
                        <Table.Cell><FormattedMessage {...messages.ticket}/></Table.Cell>
                        <Table.Cell>{ticket.description}</Table.Cell>
                        <Table.Cell><AriesDate unixTimestamp={ticket.expirationDate}/></Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </AdditionalInfo>
            </ListItem>;
          })}
        </div>
        : <p><FormattedMessage {...messages.noDataAvailable} /></p>
    }
  </Wrapper>;
};

// PropTypes
SearchListView.propTypes = {
  toggleIsOpen: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};


export default SearchListContainer(SearchListView);