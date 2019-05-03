import React from 'react';
import { storiesOf } from '@storybook/react';
import LoginView from './LoginView';

storiesOf('Login', module)
    .addWithJSX('Simple', () => <LoginView />);

