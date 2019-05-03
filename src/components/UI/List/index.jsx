import React from 'react'
import PropTypes from 'prop-types';
import { List as SemanticList } from 'semantic-ui-react'
import styled from 'styled-components'
import { NoMarginTop } from '../../../styles'

const StyledList = styled(SemanticList)`
  ${NoMarginTop}
  transition: height 1s ease-in-out;
  overflow: hidden;
  height: ${props => props.collapsed === 'true' ? '0px' : 'auto'};
`

class MyList extends React.PureComponent {

  render() {
    const {isCollapsed, ...rest} = this.props;
    return (<StyledList 
      collapsed={(!!isCollapsed).toString()}
      {...rest} />)
  }
};

MyList.propTypes = {
  isCollapsed: PropTypes.bool,
};

MyList.Item = SemanticList.Item;
MyList.Header = SemanticList.Header;

export const List = MyList;