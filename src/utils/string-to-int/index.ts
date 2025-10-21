import { fixIsNaN } from "../validators";

export const stringToInt = (value) => {
  if(value === '')  return null;
  const intValue = parseInt(value, 10)
  if(!fixIsNaN(intValue)) {
    return intValue;
  }
  return null;
}