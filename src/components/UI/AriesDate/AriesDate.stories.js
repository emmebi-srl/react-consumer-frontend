import React from 'react';
import { storiesOf } from '@storybook/react';
import AriesDate from './index';

storiesOf('UI', module)
    .addWithJSX('AriesDate (L)', () =>
        <AriesDate unixTimestamp={1526628401000} />)
    .addWithJSX('AriesDate (YYYYMMDD)', () =>
        <AriesDate unixTimestamp={1526628401000} format='YYYYMMDD' />);

