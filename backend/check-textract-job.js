const { TextractClient, GetDocumentAnalysisCommand } = require('@aws-sdk/client-textract');

const client = new TextractClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAT2XRMD6NWASFAVQ5',
    secretAccessKey: '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'
  }
});

async function checkJob() {
  try {
    const command = new GetDocumentAnalysisCommand({
      JobId: '668a314f68ffb0a2ca2562906a6cf5bd39b84f15bef0a54ee8b265650cbdb2a9'
    });
    
    const response = await client.send(command);
    console.log('Job Status:', response.JobStatus);
    console.log('Status Message:', response.StatusMessage);
    
    if (response.JobStatus === 'FAILED') {
      console.log('❌ Job failed:', response.StatusMessage);
    } else if (response.JobStatus === 'SUCCEEDED') {
      console.log('✅ Job completed successfully');
    } else {
      console.log('⏳ Job still in progress');
    }
    
  } catch (error) {
    console.error('Error checking job:', error.message);
  }
}

checkJob();