import { forwardRef, useCallback } from 'react';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { Quote } from '~/types/aries-proxy/quotes';
import { useActivate, useIsActive } from '../state';

interface QuoteTableRowProps extends DataTableRowProps {
  entity: Quote;
}

export const getQuoteSelectionId = (quote: Pick<Quote, 'id' | 'year'>) => `${quote.year}:${quote.id}`;

const QuoteTableRow = forwardRef<HTMLTableRowElement, QuoteTableRowProps>(({ entity, ...props }, ref) => {
  const activate = useActivate();
  const isActive = useIsActive();
  const selectionId = getQuoteSelectionId(entity);

  const handleClick = useCallback(() => {
    activate(selectionId);
  }, [activate, selectionId]);

  return <DataTableRow {...props} ref={ref} active={isActive(selectionId)} onClick={handleClick} />;
});

export default QuoteTableRow;
