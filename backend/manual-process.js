// Manually trigger the notification handler
const { TextractNotificationHandler } = require('./dist/workflows/textract-notification-handler');

const notification = {
  JobId: '668a314f68ffb0a2ca2562906a6cf5bd39b84f15bef0a54ee8b265650cbdb2a9',
  Status: 'SUCCEEDED',
  API: 'AnalyzeDocument',
  Timestamp: new Date().toISOString(),
  DocumentLocation: {
    S3Bucket: 'fluxa-invoices-2025',
    S3ObjectName: 'invoices/4/1757892255535-sample_invoice_4.pdf'
  }
};

TextractNotificationHandler.handleNotification(notification)
  .then(() => console.log('✅ Manual processing completed'))
  .catch(err => console.error('❌ Manual processing failed:', err));