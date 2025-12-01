import React, { useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { DropzoneProps, useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE_MB = 5;

export interface CampaignTemplateDropZoneProps {
  className?: string;
  onFileReady: (payload: { file: File; base64: string }) => void;
}
const toBase64 = (file: File): Promise<string | undefined> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const content = result.includes(',') ? result.split(',')[1] : result;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Impossibile leggere il file.'));
    reader.readAsDataURL(file);
  });

const CampaignTemplateDropZone: React.FC<CampaignTemplateDropZoneProps> = ({ className, onFileReady }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop: DropzoneProps['onDrop'] = async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError(fileRejections[0]?.errors[0]?.message || 'File non valido.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) {
      setError('Seleziona un file .html');
      return;
    }

    try {
      setError(null);
      const base64 = await toBase64(file);
      if (!base64) {
        setError('Impossibile leggere il file.');
        return;
      }

      onFileReady({ file, base64 });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_MB * 1_000_000,
    accept: {
      'text/html': ['.html'],
    },
  });

  return (
    <Stack spacing={1} className={className}>
      <Box
        {...getRootProps()}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 4,
          border: '1px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          bgcolor: isDragActive ? 'primary.50' : 'transparent',
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'background-color 250ms linear, border-color 250ms linear',
        }}
      >
        <input {...getInputProps()} />
        <UploadFileRoundedIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="subtitle1" align="center">
          Trascina qui il file HTML o clicca per selezionarlo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Formato consentito: .html &middot; Dimensione massima: {MAX_FILE_SIZE_MB}MB
        </Typography>
      </Box>
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );
};

export default CampaignTemplateDropZone;
