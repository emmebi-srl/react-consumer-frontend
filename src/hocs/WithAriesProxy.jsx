import React from 'react';
import ariesProxy from '../proxies/aries-proxy'

export default (WrapperComponent) => (props) => <WrapperComponent ariesProxy={ariesProxy} {...props}/>;
