import _merge from 'lodash/merge';
import TextField from './TextField';
import Input from './Input';
import Select from './Select';
import Link from './Link';
import { Theme } from '@mui/material';

function ComponentsOverrides(theme: Theme) {
  return _merge(TextField(), Input(), Select(), Link(theme)) as Theme['components'];
}

export default ComponentsOverrides;
