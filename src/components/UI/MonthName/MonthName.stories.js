import React from 'react';
import { storiesOf } from '@storybook/react';
import MonthName from './MonthName';

storiesOf('UI', module)
    .addWithJSX('MonthName January', () =>
        <MonthName value={1526628401000} />);

