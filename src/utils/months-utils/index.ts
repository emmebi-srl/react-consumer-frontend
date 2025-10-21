/**
 * Get translated month name by month index
 * @param {number} monthIndex must be a number between 1 and 12 indluded
 */
export const getMonthName = (monthIndex: number) => {
  let monthString = '';
  switch (monthIndex) {
    case 1:
      monthString = 'Gennaio';
      break;
    case 2:
      monthString = 'Febbraio';
      break;
    case 3:
      monthString = 'Marzo';
      break;
    case 4:
      monthString = 'Aprile';
      break;
    case 5:
      monthString = 'Maggio';
      break;
    case 6:
      monthString = 'Giugno';
      break;
    case 7:
      monthString = 'Luglio';
      break;
    case 8:
      monthString = 'Agosto';
      break;
    case 9:
      monthString = 'Settembre';
      break;
    case 10:
      monthString = 'Ottobre';
      break;
    case 11:
      monthString = 'Novembre';
      break;
    case 12:
      monthString = 'Dicembre';
      break;
    default:
      monthString = 'Mese non valido';
  }

  return monthString;
};
