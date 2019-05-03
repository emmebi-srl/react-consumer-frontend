import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { LeftButton } from './prop-types'
import { CenterVertically, navbarGrey, DarkGrey, FullPageContent } from '../../styles'
import { Button, Icon } from '../UI'
import { withRouter } from 'react-router-dom'

export const createRightButton = ({ref, caption, onClick, isLoading, icon, 
    animated, primary, secondary, ButtonWrapper}) => {

  return {
    ref,
    caption,
    onClick,
    isLoading,
    icon,
    primary,
    animated,
    secondary,
    ButtonWrapper,
  }
};

const MainContainer = styled.div`
  position: relative;
  height: 50px;
  width: 100%;

  &.sticky-action-bar{
    position: fixed!important;
    top: 0;
    background-color: ${navbarGrey};
    z-index: 200;
    border-bottom: 1px solid ${DarkGrey};
    left: 0px;
  }
  &.sticky-action-bar + .content {
    padding-top: 50px;
  }
`
const ButtonContainer = styled.div`
  position: relative;
  ${FullPageContent};
  height: 50px;
`

const RightContainer = styled.div`
  right: 0;
  ${CenterVertically}
`
const LeftContainer = styled.div`
  left: 0;
  margin-left: 5px;
  ${CenterVertically}
`

const TypedButton = ({caption, icon, animated, primary, secondary, 
  ButtonWrapper, onClick}) => {

  const attr = {};

  let isAnimated = false;
  if(primary === true) attr.primary = true;
  else if(secondary === true) attr.secondary = true;
  
  if(animated !== undefined) {
    isAnimated = true;
    attr.animated = animated;
  }
  
  let MyButton;
  if(!isAnimated){
    MyButton = ({wrapperClick}) => <Button {...attr} onClick={() => {
        if(onClick) onClick();
        if(wrapperClick) wrapperClick();
      }}>
      {icon ? <Icon name={icon} /> : null}
      {caption}
    </Button>;
  } else {
    MyButton = ({wrapperClick}) => <Button {...attr} onClick={() => {
        if(onClick) onClick();
        if(wrapperClick) wrapperClick();
      }}>
      <Button.Content hidden>{caption}</Button.Content>
      <Button.Content visible>
        <Icon name={icon} />
      </Button.Content>
    </Button>;
  }

  return ButtonWrapper ? <ButtonWrapper button={MyButton}/> : <MyButton />;
}

class ActionsBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }
  componentDidMount() {
    window.onscroll = this.handleScrolling;
  }

  componentWillUnmount() {
    window.onscroll = null;
  }
  handleScrolling = () => {
    if(this.mainRef){
      if (window.pageYOffset >= 90) {
        this.mainRef.current.classList.add("sticky-action-bar")
      } else {
        this.mainRef.current.classList.remove("sticky-action-bar");
      }
    }
  }

  render() {
    const { rightButtons, intl: { formatMessage }, history } = this.props;
    return (
      <MainContainer innerRef={this.mainRef}>
        <ButtonContainer>
          <LeftContainer>
            <Button 
              icon 
              labelPosition='left'
              onClick={() => history.goBack()}>
              {formatMessage({id: 'BACK'})}
              <Icon name="left arrow" />
            </Button>
          </LeftContainer>
          <RightContainer>
            {rightButtons.map((button) => {
              const { ref, ...rest } = button;
              return <TypedButton key={ref} {...rest}/>
            })}
          </RightContainer> 
        </ButtonContainer>
      </MainContainer>
    );
  }
}

ActionsBar.propTypes = {
  rightButtons: PropTypes.arrayOf(LeftButton).isRequired,
}

export default withRouter(injectIntl(ActionsBar))
