import React from 'react';
import { configure, setAddon, addDecorator } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import localeData from '../src/assets/locales/data.json'
import monthsUtils from '../src/utils/months-utils'

import '../src/index.css'
import 'semantic-ui-css/semantic.min.css'


const req = require.context('../src/components', true, /\.stories\.js$/)
const language = 'en';
const messages = localeData['it'];

// set format message in external class
const { intl } = new IntlProvider({locale: language, messages}).getChildContext();
monthsUtils.setFormatMessage(intl.formatMessage);

setAddon(JSXAddon)

function loadStories() {
  addDecorator(story => (
    <BrowserRouter>
      <IntlProvider locale={language} messages={messages}>
          { story() }
      </IntlProvider>
    </BrowserRouter>
  ));

  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);