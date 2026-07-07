import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Add, ArrowBack, Delete, Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import PageContainer from '~/components/Layout/PageContainer';
import {
  useCreateReport,
  useCreateReportFromMobile,
  useReportById,
  useUpdateReport,
} from '~/proxies/aries-proxy/reports';
import {
  Report,
  ReportFromMobile,
  ReportLaborRow,
  ReportMaterial,
  ReportSave,
  ReportTechnician,
} from '~/types/aries-proxy/reports';
import { RouteConfig } from '~/routes/routeConfig';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';

interface FormState {
  cost: string;
  customerId: string;
  date: string;
  destinationId: string;
  finishedWork: boolean;
  id: string;
  interventionTypeId: string;
  mobileId: string;
  mobileYear: string;
  notesHighlights: string;
  price: string;
  reportNumber: string;
  requestedBy: string;
  responsible: string;
  responsibleJob: string;
  rightCall: boolean;
  rightCallType: string;
  statusId: string;
  subscriptionId: string;
  systemId: string;
  systemWorking: string;
  technicalReport: string;
  technicianNotes: string;
  workCost: string;
  workPrice: string;
  year: string;
}

const todayInputValue = () => format(new Date(), 'yyyy-MM-dd');

const inputDateValue = (value?: number | null) => {
  if (!value) return todayInputValue();
  return format(getDateByUnixtimestamp({ unixTimestamp: value }), 'yyyy-MM-dd');
};

const numericValue = (value: string) => (value.trim() === '' ? undefined : Number(value));
const numericOrZero = (value: string) => (value.trim() === '' ? 0 : Number(value));
const stringValue = (value?: string | null) => value ?? '';
const hoursFromMinutes = (minutes: number) => (minutes / 60).toString();
const minutesFromHours = (hours: string) => numericOrZero(hours) * 60;

const getInitialState = (report?: Report): FormState => ({
  cost: report?.cost.toString() ?? '0',
  customerId: report?.customerId.toString() ?? '',
  date: inputDateValue(report?.date),
  destinationId: report?.destinationId.toString() ?? '',
  finishedWork: report?.finishedWork ?? false,
  id: report?.id.toString() ?? '',
  interventionTypeId: report?.interventionTypeId.toString() ?? '1',
  mobileId: '',
  mobileYear: new Date().getFullYear().toString(),
  notesHighlights: report?.notesHighlights ?? '',
  price: report?.price.toString() ?? '0',
  reportNumber: report?.reportNumber ?? '',
  requestedBy: report?.requestedBy ?? '',
  responsible: report?.responsible ?? '',
  responsibleJob: report?.responsibleJob ?? '',
  rightCall: report?.rightCall ?? false,
  rightCallType: report?.rightCallType.toString() ?? '0',
  statusId: report?.statusId.toString() ?? '1',
  subscriptionId: report?.subscriptionId?.toString() ?? '',
  systemId: report?.systemId.toString() ?? '',
  systemWorking: report?.systemWorking.toString() ?? '1',
  technicalReport: report?.technicalReport ?? '',
  technicianNotes: report?.technicianNotes ?? '',
  workCost: report?.workCost.toString() ?? '0',
  workPrice: report?.workPrice.toString() ?? '0',
  year: report?.year.toString() ?? new Date().getFullYear().toString(),
});

const emptyTechnician = (): ReportTechnician => ({
  highwayCost: 0,
  kilometers: 0,
  otherCost: 0,
  otherDescription: '',
  parkingCost: 0,
  reportId: 0,
  reportNumber: 0,
  reportYear: 0,
  technicianId: 0,
  technicianName: '',
  travelExpense: 0,
  travelTime: 0,
});

const emptyLaborRow = (): ReportLaborRow => ({
  anomalyDescription: '',
  anomalyTypeId: undefined,
  endTime: '',
  hourPrice: 0,
  note: '',
  overtimeType: 0,
  reportId: 0,
  reportYear: 0,
  startTime: '',
  technicianId: 0,
  technicianName: '',
  totalMinutes: 0,
  workId: 0,
  workName: '',
});

const emptyMaterial = (rowId: number): ReportMaterial => ({
  cost: 0,
  description: '',
  discount: 0,
  economy: false,
  economyQuantity: 0,
  measureUnit: '',
  noteId: undefined,
  price: 0,
  productCode: '',
  quantity: 1,
  reportId: 0,
  reportYear: 0,
  rowId,
  rowType: 'M',
  warehouseId: undefined,
});

const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <Box sx={{ pt: 2 }}>
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Stack>
  </Box>
);

const ReportEditView = () => {
  const { reportId, year } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mobileSource = location.state as { mobileId?: number; mobileYear?: number } | null;
  const isMobileMode = location.pathname === RouteConfig.ReportFromMobile.buildLink();
  const isEditMode = Boolean(reportId && year);
  const parsedId = Number(reportId ?? 0);
  const parsedYear = Number(year ?? 0);

  const reportQuery = useReportById(parsedYear, parsedId);
  const report = reportQuery.data?.reports[0];
  const createReport = useCreateReport();
  const createFromMobile = useCreateReportFromMobile();
  const updateReport = useUpdateReport();

  const [form, setForm] = useState<FormState>(() => getInitialState());
  const [technicians, setTechnicians] = useState<ReportTechnician[]>([]);
  const [laborRows, setLaborRows] = useState<ReportLaborRow[]>([]);
  const [materials, setMaterials] = useState<ReportMaterial[]>([]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!report) return;

    setForm(getInitialState(report));
    setTechnicians(report.technicians ?? []);
    setLaborRows(report.laborRows ?? []);
    setMaterials(report.materials ?? []);
  }, [isEditMode, report]);

  useEffect(() => {
    if (!isMobileMode) return;
    if (!mobileSource?.mobileId || !mobileSource.mobileYear) return;

    setForm((current) => ({
      ...current,
      mobileId: mobileSource.mobileId?.toString() ?? current.mobileId,
      mobileYear: mobileSource.mobileYear?.toString() ?? current.mobileYear,
    }));
  }, [isMobileMode, mobileSource?.mobileId, mobileSource?.mobileYear]);

  const title = useMemo(() => {
    if (isMobileMode) return 'Rapporto da mobile';
    if (isEditMode) return report ? `Rapporto ${report.id}/${report.year}` : 'Rapporto';
    return 'Nuovo rapporto';
  }, [isEditMode, isMobileMode, report]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildSavePayload = (): ReportSave => ({
    customerId: numericValue(form.customerId),
    date: form.date,
    destinationId: numericValue(form.destinationId),
    finishedWork: form.finishedWork,
    id: numericValue(form.id),
    interventionTypeId: numericValue(form.interventionTypeId),
    laborRows,
    materials,
    notesHighlights: form.notesHighlights,
    reportNumber: form.reportNumber,
    reportTypeId: 2,
    requestedBy: form.requestedBy,
    responsible: form.responsible,
    responsibleJob: form.responsibleJob,
    rightCall: form.rightCall,
    rightCallType: numericValue(form.rightCallType),
    sourceTypeId: 1,
    statusId: numericValue(form.statusId),
    subscriptionId: numericValue(form.subscriptionId) ?? null,
    systemId: numericValue(form.systemId),
    systemWorking: numericValue(form.systemWorking),
    technicalReport: form.technicalReport,
    technicianNotes: form.technicianNotes,
    technicians,
    year: numericValue(form.year),
  });

  const navigateToSavedReport = (saved?: Report) => {
    if (!saved) {
      navigate(RouteConfig.ReportList.buildLink());
      return;
    }

    navigate(RouteConfig.ReportEdit.buildLink({ reportId: saved.id.toString(), year: saved.year.toString() }));
  };

  const handleSubmit = async () => {
    if (isMobileMode) {
      const payload: ReportFromMobile = {
        id: numericValue(form.id),
        mobileId: Number(form.mobileId),
        mobileYear: Number(form.mobileYear),
        year: numericValue(form.year),
      };
      const result = await createFromMobile.mutateAsync(payload);
      navigateToSavedReport(result.reports[0]);
      return;
    }

    const payload = buildSavePayload();
    if (isEditMode) {
      const result = await updateReport.mutateAsync({ id: parsedId, year: parsedYear, data: payload });
      navigateToSavedReport(result.reports[0]);
      return;
    }

    const result = await createReport.mutateAsync(payload);
    navigateToSavedReport(result.reports[0]);
  };

  const updateRow = <T, K extends keyof T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    key: K,
    value: T[K],
  ) => {
    setter((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const removeRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    setter((current) => current.filter((_row, rowIndex) => rowIndex !== index));
  };

  const isPending = createReport.isPending || updateReport.isPending || createFromMobile.isPending;
  const isError = createReport.isError || updateReport.isError || createFromMobile.isError || reportQuery.isError;

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <IconButton
            component={RouterLink}
            to={RouteConfig.ReportList.buildLink()}
            color="primary"
            aria-label="Torna ai rapporti"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">{title}</Typography>
        </Stack>

        {isError ? <Alert severity="error">Operazione non riuscita.</Alert> : null}

        <Section title="Intestazione">
          <Grid container spacing={2}>
            {isMobileMode ? (
              <>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="ID mobile"
                    type="number"
                    value={form.mobileId}
                    onChange={(event) => setField('mobileId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Anno mobile"
                    type="number"
                    value={form.mobileYear}
                    onChange={(event) => setField('mobileYear', event.target.value)}
                  />
                </Grid>
              </>
            ) : null}
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Numero"
                type="number"
                value={form.id}
                disabled={isEditMode}
                onChange={(event) => setField('id', event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Anno"
                type="number"
                value={form.year}
                disabled={isEditMode}
                onChange={(event) => setField('year', event.target.value)}
              />
            </Grid>

            {!isMobileMode ? (
              <>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Data"
                    type="date"
                    value={form.date}
                    onChange={(event) => setField('date', event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Stato"
                    type="number"
                    value={form.statusId}
                    onChange={(event) => setField('statusId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Tipo intervento"
                    type="number"
                    value={form.interventionTypeId}
                    onChange={(event) => setField('interventionTypeId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Rapporto"
                    value={form.reportNumber}
                    onChange={(event) => setField('reportNumber', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Cliente"
                    type="number"
                    value={form.customerId}
                    onChange={(event) => setField('customerId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Impianto"
                    type="number"
                    value={form.systemId}
                    onChange={(event) => setField('systemId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Destinazione"
                    type="number"
                    value={form.destinationId}
                    onChange={(event) => setField('destinationId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Abbonamento"
                    type="number"
                    value={form.subscriptionId}
                    onChange={(event) => setField('subscriptionId', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Richiesto da"
                    value={form.requestedBy}
                    onChange={(event) => setField('requestedBy', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Responsabile"
                    value={form.responsible}
                    onChange={(event) => setField('responsible', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Mansione"
                    value={form.responsibleJob}
                    onChange={(event) => setField('responsibleJob', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Funzionante"
                    type="number"
                    value={form.systemWorking}
                    onChange={(event) => setField('systemWorking', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Tipo diritto"
                    type="number"
                    value={form.rightCallType}
                    onChange={(event) => setField('rightCallType', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.rightCall}
                        onChange={(event) => setField('rightCall', event.target.checked)}
                      />
                    }
                    label="Diritto chiamata"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.finishedWork}
                        onChange={(event) => setField('finishedWork', event.target.checked)}
                      />
                    }
                    label="Terminato"
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Section>

        {!isMobileMode ? (
          <>
            <Divider />
            <Section title="Relazione">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Relazione tecnica"
                    value={form.technicalReport}
                    onChange={(event) => setField('technicalReport', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Note in evidenza"
                    value={form.notesHighlights}
                    onChange={(event) => setField('notesHighlights', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Appunti tecnico"
                    value={form.technicianNotes}
                    onChange={(event) => setField('technicianNotes', event.target.value)}
                  />
                </Grid>
              </Grid>
            </Section>

            <Divider />
            <Section title="Tecnici">
              <Stack alignItems="flex-start">
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => setTechnicians((current) => [...current, emptyTechnician()])}
                >
                  Inserisci
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tecnico</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Km</TableCell>
                    <TableCell>Tempo</TableCell>
                    <TableCell>Trasferta</TableCell>
                    <TableCell>Aut.</TableCell>
                    <TableCell>Park</TableCell>
                    <TableCell>Altro</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {technicians.map((row, index) => (
                    <TableRow key={`${row.technicianId}-${index}`}>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.technicianId}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'technicianId', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.technicianName)}
                          onChange={(event) => updateRow(setTechnicians, index, 'technicianName', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.kilometers}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'kilometers', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.travelTime}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'travelTime', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.travelExpense}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'travelExpense', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.highwayCost}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'highwayCost', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.parkingCost}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'parkingCost', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.otherCost}
                          onChange={(event) =>
                            updateRow(setTechnicians, index, 'otherCost', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.otherDescription)}
                          onChange={(event) => updateRow(setTechnicians, index, 'otherDescription', event.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeRow(setTechnicians, index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Divider />
            <Section title="Manodopera">
              <Stack alignItems="flex-start">
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => setLaborRows((current) => [...current, emptyLaborRow()])}
                >
                  Inserisci
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tecnico</TableCell>
                    <TableCell>Lavoro</TableCell>
                    <TableCell>Descrizione</TableCell>
                    <TableCell>Ora inizio</TableCell>
                    <TableCell>Ora fine</TableCell>
                    <TableCell>Ore</TableCell>
                    <TableCell>Prezzo ora</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laborRows.map((row, index) => (
                    <TableRow key={`${row.technicianId}-${row.workId}-${index}`}>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.technicianId}
                          onChange={(event) =>
                            updateRow(setLaborRows, index, 'technicianId', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.workId}
                          onChange={(event) =>
                            updateRow(setLaborRows, index, 'workId', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.workName)}
                          onChange={(event) => updateRow(setLaborRows, index, 'workName', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="time"
                          value={stringValue(row.startTime)}
                          onChange={(event) => updateRow(setLaborRows, index, 'startTime', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="time"
                          value={stringValue(row.endTime)}
                          onChange={(event) => updateRow(setLaborRows, index, 'endTime', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={hoursFromMinutes(row.totalMinutes)}
                          onChange={(event) =>
                            updateRow(setLaborRows, index, 'totalMinutes', minutesFromHours(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.hourPrice}
                          onChange={(event) =>
                            updateRow(setLaborRows, index, 'hourPrice', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.overtimeType}
                          onChange={(event) =>
                            updateRow(setLaborRows, index, 'overtimeType', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.note)}
                          onChange={(event) => updateRow(setLaborRows, index, 'note', event.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeRow(setLaborRows, index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Divider />
            <Section title="Materiale">
              <Stack alignItems="flex-start">
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => setMaterials((current) => [...current, emptyMaterial(current.length + 1)])}
                >
                  Inserisci
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Codice</TableCell>
                    <TableCell>Descrizione</TableCell>
                    <TableCell>UM</TableCell>
                    <TableCell>Qta</TableCell>
                    <TableCell>Costo</TableCell>
                    <TableCell>Prezzo</TableCell>
                    <TableCell>Sconto</TableCell>
                    <TableCell>Mag.</TableCell>
                    <TableCell>Eco.</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((row, index) => (
                    <TableRow key={`${row.rowId}-${index}`}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.productCode)}
                          onChange={(event) => updateRow(setMaterials, index, 'productCode', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.description)}
                          onChange={(event) => updateRow(setMaterials, index, 'description', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={stringValue(row.measureUnit)}
                          onChange={(event) => updateRow(setMaterials, index, 'measureUnit', event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(setMaterials, index, 'quantity', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.cost}
                          onChange={(event) =>
                            updateRow(setMaterials, index, 'cost', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.price}
                          onChange={(event) =>
                            updateRow(setMaterials, index, 'price', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.discount}
                          onChange={(event) =>
                            updateRow(setMaterials, index, 'discount', numericOrZero(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.warehouseId ?? ''}
                          onChange={(event) =>
                            updateRow(setMaterials, index, 'warehouseId', numericValue(event.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row.economy}
                          onChange={(event) => updateRow(setMaterials, index, 'economy', event.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeRow(setMaterials, index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Divider />
            <Section title="Totali">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Prezzo"
                    type="number"
                    value={form.price}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Costo"
                    type="number"
                    value={form.cost}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Lavoro prezzo"
                    type="number"
                    value={form.workPrice}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Lavoro costo"
                    type="number"
                    value={form.workCost}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
              </Grid>
            </Section>
          </>
        ) : null}

        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button component={RouterLink} to={RouteConfig.ReportList.buildLink()} disabled={isPending}>
            Annulla
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={isPending || reportQuery.isLoading}
          >
            Salva
          </Button>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default ReportEditView;
