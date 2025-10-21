import { isNull } from 'lodash';
import { useState } from 'react';

export const useEllipsisTooltip = (fullTitle: string | undefined) => {
  const [isUsingEllipsis, setIsUsingEllipsis] = useState(false);

  const ref = (e: HTMLElement) => {
    setIsUsingEllipsis(!isNull(e) && e.offsetWidth < e.scrollWidth);
  };

  const title = isUsingEllipsis ? fullTitle : '';

  return { ref, title };
};
