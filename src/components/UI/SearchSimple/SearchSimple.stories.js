import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchSimple from './SearchSimple';

storiesOf('UI', module)
    .addWithJSX('Search Simple', () => <SearchSimple />);

