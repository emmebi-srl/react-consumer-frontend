import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { media } from '../../../styles';

export const Chevron = styled.i`
  margin-right: ${props => props.size}px;
  display: inline-block;
  &:hover {
    &:before {
      ${props => props.hoverColour && css`
        border-right-color: ${props.hoverColour};
        border-top-color: ${props.hoverColour};
      `}
    }
  }

  &:before {
    position: ${props => props.position};
    margin-right: ${props => props.size}px;
    top: ${props => props.top != null ? props.top : 14 + (14-props.size)}px;
    right: ${props => props.rightMobile == null ? props.rightMobile : props.right}px;
    content: "";
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border-right: ${props => Math.floor(props.size / 5)}px solid ${props => props.isActive ? props.activeFill : props.fill};
    border-top: ${props => Math.floor(props.size / 5)}px solid ${props => props.isActive ? props.activeFill : props.fill};
    display: inline-block; 
    transition: all ${props => props.transitionSpeed}s;

    ${props => props.centerVertically === true && `
      top: calc(50% - ${props.size/2}px);
    `}

    ${props => props.direction === 'right' && `
      transform: rotate(45deg);
    `}
    ${props => props.direction === 'top' && `
      transform: rotate(315deg);
      top: calc(50% - ${props.size/2.5}px);
    `}
    ${props => props.direction === 'bottom' && `
      transform: rotate(135deg);
      top: calc(50% - ${props.size/1.5}px);
    `}  
    ${props => props.direction === 'left' && `
      transform: rotate(225deg);
      right: unset;
      left: ${props => props.left}px;
    `}  

    ${media.tablet(css`
      right: ${props => props.right}px;
    `)}   
  }
`;

Chevron.propTypes = {
  size: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  right: PropTypes.number,
  top: PropTypes.number,
  rightMobile: PropTypes.number,
  transitionSpeed: PropTypes.number,
  left: PropTypes.number,
  direction: PropTypes.oneOf(['bottom', 'right', 'left', 'top']),
  activeFill: PropTypes.string,
  isActive: PropTypes.bool,
  position: PropTypes.oneOf(['absolute', 'relative']),
};

Chevron.defaultProps = {
  size: 14,
  fill: 'black',
  transitionSpeed: 0.25,
  direction: 'right',
  activeFill: 'green',
  position: 'absolute',
};

