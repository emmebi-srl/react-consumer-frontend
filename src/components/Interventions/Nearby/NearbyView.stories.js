import React from 'react';
import { storiesOf } from '@storybook/react';
import Nearby from './NearbyVIew';

storiesOf('Nearby', module)
    .addWithJSX('Basic', () => <Nearby isLoading={false} />);

