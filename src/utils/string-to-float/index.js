import { fixIsNaN } from "../validators";

export const stringToFloat = (value) => {
  if(value === '')  return null;
  const myFloat = parseFloat(value)
  if(!fixIsNaN(myFloat)) {
    return myFloat;
  }
  return null;
}