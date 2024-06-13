const core = require('@actions/core');
const github = require('@actions/github');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');
const { v4: uuidv4 } = require('uuid');

async function runWorkflowAsync() {
    const accountName = core.getInput('azure-storage-account-name');
    if (!accountName) {
        core.setFailed('Azure Storage accountName not found');
        return;
    }

    console.log('test-----------test');

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );
    const containerName = core.getInput('azure-storage-container-name');
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const clientWorkflowId = uuidv4();
    const blobName = `new/${clientWorkflowId}.json`;
    const failedBlobPrefix = `failed/${clientWorkflowId}`;
    const succeededBlobPrefix = `succeeded/${clientWorkflowId}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = {
        "WorkflowUrl": core.getInput("workflow-path"),
        "WorkflowInputsUrl": core.getInput("workflow-inputs-path"),
        "WorkflowOptionsUrl": core.getInput("workflow-options-path"),
        "WorkflowDependenciesUrl": core.getInput("workflow-dependencies-path")
    };

    const jsonData = JSON.stringify(data);
    const startTime = Date.now();

    try {
        await blockBlobClient.upload(jsonData, jsonData.length);
        console.log(`Trigger file created: ${blockBlobClient.url}`);
    } catch (error) {
        core.setFailed(`Error uploading blob: ${error.message}`);
        return;
    }

    let isDone = false;

    // Loop until the workflow is done
    while (!isDone) {
        try {
            for await (const {} of containerClient.listBlobsFlat({ prefix: succeededBlobPrefix })) {
                console.log('Workflow succeeded.');
                core.setOutput("status", "succeeded");
                isDone = true
                break;
            }

            if (isDone) break;

            for await (const {} of containerClient.listBlobsFlat({ prefix: failedBlobPrefix })) {
                core.setFailed('Workflow failed.');
                isDone = true;
                break;
            }

            if (isDone) break;
        } catch (error) {
            console.log(`Error occurred; will retry in 30s.  ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 30000)); // wait 30 seconds before checking again
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Duration in seconds
    const hours = Math.floor(duration / 3600); // Calculate hours
    const minutes = Math.floor((duration % 3600) / 60); // Calculate minutes
    const seconds = Math.floor(duration % 60); // Calculate seconds

    console.log(`Workflow completed in ${hours}h ${minutes}m ${seconds}s`);
}

async function run() {
    try {
        await runWorkflowAsync();
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
