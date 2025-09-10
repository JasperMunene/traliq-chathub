// Configuration for the ChatHub client
export const config = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    timeout: 300000, // 5 minutes
  },
  
  // Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFileTypes: [
      '.pdf', '.doc', '.docx', '.txt', '.rtf',
      '.csv', '.xlsx', '.xls'
    ],
    supportedMimeTypes: {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/msword': 'doc',
      'text/csv': 'csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/plain': 'txt',
      'application/rtf': 'rtf'
    }
  },
  
  // Default namespace - this should be configurable per user/business
  defaultNamespace: process.env.NEXT_PUBLIC_DEFAULT_NAMESPACE || 'default',
  
  // Polling configuration for task status
  polling: {
    interval: 2000, // 2 seconds
    maxRetries: 150, // 5 minutes total (150 * 2s)
    backoffMultiplier: 1.5,
  }
};

export default config;
