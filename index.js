const core = require('@actions/core');
const github = require('@actions/github');
const { DefaultAzureCredential } = require('@azure/identity');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);

  console.log('-----------(-1)');
    // Delay to ensure all logs are processed
  setTimeout(() => {
    console.log('Ensuring all log messages are displayed.');
  }, 1000);
  const accountName = core.getInput('azure-storage-account-name');
  // process.env.AZURE_STORAGE_ACCOUNT_NAME;
  console.log('----------- 0');
  if (!accountName) throw Error('Azure Storage accountName not found');

  console.log('----1');

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  console.log('----2');

  const containerName = core.getInput('azure-storage-container-name'); // 'quickstart';
  console.log('----3');
  const containerClient = blobServiceClient.getContainerClient(containerName);
  console.log('----4');

  // Create a unique name for the blob
  const blobName = 'quickstart.txt';
  console.log('----5');

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  console.log('----6');

  // Display blob name and url
  console.log(
    `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
  );

  console.log('----7');

  // Upload data to the blob
  const data = 'Hello, World!';
  console.log('----8');
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(
    `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
  );

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
