import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchRemote from './SearchRemote';

storiesOf('UI', module)
    .addWithJSX('Search Remote', () => <SearchRemote />);

