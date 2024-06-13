const core = require('@actions/core');
const { v4: uuidv4 } = require('uuid');

async function runWorkflowAsync(containerClient) {
    const clientWorkflowId = uuidv4();
    const blobName = `new/${clientWorkflowId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = {
        "WorkflowUrl": core.getInput("workflow-path"),
        "WorkflowInputsUrl": core.getInput("workflow-inputs-path"),
        "WorkflowOptionsUrl": core.getInput("workflow-options-path"),
        "WorkflowDependenciesUrl": core.getInput("workflow-dependencies-path")
    };
    const jsonData = JSON.stringify(data);

    try {
        await blockBlobClient.upload(jsonData, jsonData.length);
        console.log(`Trigger file created: ${blockBlobClient.url}`);
        return clientWorkflowId;
    } catch (error) {
        core.setFailed(`Error uploading blob: ${error.message}`);
        throw error;
        // return;
    }
}

async function run(containerClient) {
    try {
        const clientWorkflowId = await runWorkflowAsync(containerClient);
        return clientWorkflowId;
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
};

exports.run = run;
