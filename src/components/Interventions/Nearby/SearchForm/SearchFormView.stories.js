import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchForm from './SearchFormView';

storiesOf('SearchFormView', module)
    .addWithJSX('Basic', () => <SearchForm />);

