const core = require('@actions/core');
const github = require('@actions/github');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);

  const accountName = core.getInput('azure-storage-account-name');
  // process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) throw Error('Azure Storage accountName not found');

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerName = core.getInput('azure-storage-container-name'); // 'quickstart';

  const containerClient = blobServiceClient.getContainerClient(containerName);

//
//  // Create a unique name for the blob
//  const blobName = 'quickstart.txt';
//  console.log('----5');
//
//  // Get a block blob client
//  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//  console.log('----6');
//
//  // Display blob name and url
//  console.log(
//    `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
//  );
//
//  console.log('----7');
//
//  // Upload data to the blob
//  const data = 'Hello, World!';
//  console.log('----8');
//  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
//  console.log(
//    `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
//  );

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
