import { useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { downloadFile } from './api/files-explorer';
import { assertIsDefined } from '~/types/typeGuards';

export const FilesExplorerQueryKeys = {
  downloadFile: (path?: string | null) => ['FilesExplorer', 'downloadFile', path] as const,
};

export const useFilesExplorerDownloadFile = (path?: string | null) => {
  return useQuery({
    queryKey: FilesExplorerQueryKeys.downloadFile(path),
    queryFn: async () => {
      assertIsDefined(path, 'Path is required to download file');
      const response = await downloadFile({ path });
      return response.data;
    },
    enabled: !_isEmpty(path),
  });
};
