import React, { PureComponent } from 'react'
import { Menu } from 'semantic-ui-react'
import styled from 'styled-components';
import { BackgroundNavbar } from '../../styles';
import withRouter from 'react-router-dom/withRouter';
import messages from './messages';
import { FormattedMessage } from 'react-intl';

const NavbarConainer = styled.div`
  padding: 0px;
  ${BackgroundNavbar}
`

class NavbarView extends PureComponent {
  state = { activeItem: 'checklist' }

  handleItemClick = (name, route) => {
    this.setState({ activeItem: name });
    this.props.history.push(route);
  };

  render() {
    const { activeItem } = this.state

    return (
      <NavbarConainer>
        <Menu pointing secondary>
          <Menu.Item name='checklist'
            children={<FormattedMessage {...messages.checklists} />}
            active={activeItem === 'checklist'}
            onClick={(e, { name }) => this.handleItemClick(name, '/checklist')} />
            
          <Menu.Item name='customers'
            children={<FormattedMessage {...messages.customers} />}
            active={activeItem === 'customers'}
            onClick={(e, { name }) => this.handleItemClick(name, '/customers')} />

          <Menu.Item name='interventions'
            children={<FormattedMessage {...messages.interventions} />}
            active={activeItem === 'interventions'}
            onClick={(e, { name }) => this.handleItemClick(name, '/interventions')} />
        </Menu>
      </NavbarConainer>
    )
  }
}

export default withRouter(NavbarView)
