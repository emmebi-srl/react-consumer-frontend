import { forwardRef } from 'react';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { Report } from '~/types/aries-proxy/reports';
import { useActivate, useIsActive } from '../state';

interface ReportTableRowProps extends DataTableRowProps {
  entity: Report;
}

const reportSelectionId = (report: Report) => `${report.year}:${report.id}`;

const ReportTableRow = forwardRef<HTMLTableRowElement, ReportTableRowProps>(({ entity, ...props }, ref) => {
  const activate = useActivate();
  const isActive = useIsActive();
  const selectionId = reportSelectionId(entity);

  return <DataTableRow {...props} ref={ref} active={isActive(selectionId)} onClick={() => activate(selectionId)} />;
});

export default ReportTableRow;
