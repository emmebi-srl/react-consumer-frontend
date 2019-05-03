import React, { PureComponent } from 'react'
import { Menu } from 'semantic-ui-react'
import styled from 'styled-components';
import { BackgroundNavbar } from '../../styles';

const NavbarConainer = styled.div`
  padding: 0px;
  ${BackgroundNavbar}
`

export default class NavbarView extends PureComponent {
  state = { activeItem: 'checklist' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <NavbarConainer>
        <Menu pointing secondary>
          <Menu.Item name='checklist' active={activeItem === 'checklist'} onClick={this.handleItemClick} />
        </Menu>
      </NavbarConainer>
    )
  }
}
