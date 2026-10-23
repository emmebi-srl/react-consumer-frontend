import _merge from 'lodash/merge';
import TextField from './TextField';
import Input from './Input';
import Select from './Select';
import Link from './Link';
import InputLabel from './InputLabel';
import { Theme } from '@mui/material';

function ComponentsOverrides(theme: Theme) {
  return _merge(TextField(), Input(), InputLabel(theme), Select(), Link(theme)) as Theme['components'];
}

export default ComponentsOverrides;
