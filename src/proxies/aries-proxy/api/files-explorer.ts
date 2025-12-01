import ariesServicesClient from '~/clients/aries-services-client';
import { FilesExplorerDownloadFileRequest } from '~/types/aries-proxy/files-explorer';

export const downloadFile = (params: FilesExplorerDownloadFileRequest) => {
  return ariesServicesClient.get<string>('files-explorer/download-file', {
    params,
  });
};
