const core = require('@actions/core');
const github = require('@actions/github');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');


async function createTriggerFile() {
  try {
    const accountName = core.getInput('azure-storage-account-name');
    if (!accountName) throw Error('Azure Storage accountName not found');

    const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
    );

    const containerName = core.getInput('azure-storage-container-name');
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = core.getInput('azure-storage-blob-name');
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
    `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );

    // Upload data to the blob
    const data = {
        "WorkflowUrl": "aaa",
        "WorkflowInputsUrl": "bbb",
        "WorkflowOptionsUrl": null,
        "WorkflowDependenciesUrl": "ccc"
        };

    const jsonData = JSON.stringify(data);
    const uploadBlobResponse = await blockBlobClient.upload(jsonData, jsonData.length);
    console.log(
    `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);

  createTriggerFile();

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
