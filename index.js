const core = require('@actions/core');
const github = require('@actions/github');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');
const { v4: uuidv4 } = require('uuid');

async function createTriggerFile() {
    const accountName = core.getInput('azure-storage-account-name');
    if (!accountName) {
        core.setFailed('Azure Storage accountName not found');
        return;
    }

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );

    const containerName = core.getInput('azure-storage-container-name');
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const triggerFileId = uuidv4();
    const blobName = `new/${triggerFileId}.json`;
    const failedBlobPrefix = `failed/${triggerFileId}`;
    const succeededBlobPrefix = `succeeded/${triggerFileId}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload data to the blob
    const data = {
        "WorkflowUrl": core.getInput("workflow-path"),
        "WorkflowInputsUrl": core.getInput("workflow-inputs-path"),
        "WorkflowOptionsUrl": core.getInput("workflow-options-path"),
        "WorkflowDependenciesUrl": core.getInput("workflow-dependencies-path")
    };
    const jsonData = JSON.stringify(data);
    try {
        await blockBlobClient.upload(jsonData, jsonData.length);
        console.log(`Blob was uploaded successfully. URL: ${blockBlobClient.url}`);
    } catch (error) {
        core.setFailed(`Error uploading blob: ${error.message}`);
        return;
    }

    // Loop to check for success or failure indicators
    while (true) {
        let successFound = false;
        let failureFound = false;

        for await (const blob of containerClient.listBlobsFlat({ prefix: succeededBlobPrefix })) {
            if (blob.name.startsWith(succeededBlobPrefix)) {
                successFound = true;
                break;
            }
        }
        for await (const blob of containerClient.listBlobsFlat({ prefix: failedBlobPrefix })) {
            if (blob.name.startsWith(failedBlobPrefix)) {
                failureFound = true;
                break;
            }
        }

        if (successFound) {
            console.log('Success blob found. Trigger file processing succeeded.');
            core.setOutput("status", "succeeded");
            break;
        } else if (failureFound) {
            core.setFailed('Failure blob found. Trigger file processing failed.');
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 30000)); // wait 30 seconds before checking again
    }
}

async function run() {
    try {
        await createTriggerFile();
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
