import React, { PureComponent } from 'react'
import { Menu } from 'semantic-ui-react'
import styled from 'styled-components';
import { BackgroundNavbar } from '../../styles';
import withRouter from 'react-router-dom/withRouter';

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
          <Menu.Item name='checklist' active={activeItem === 'checklist'} onClick={(e, { name }) => this.handleItemClick(name, '/checklist')} />
          <Menu.Item name='clienti' active={activeItem === 'clienti'} onClick={(e, { name }) => this.handleItemClick(name, '/clients')} />
        </Menu>
      </NavbarConainer>
    )
  }
}

export default withRouter(NavbarView)
