const core = require('@actions/core');
const submit = require('./src/submit');
const monitor = require('./src/monitor');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = {
    runCreateTask: submit.run
};

async function run() {
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
    const blobBaseName = core.getInput('azure-storage-blob-name');

    try {
        const subcommand = core.getInput('subcommand');
        if (subcommand === 'synchronous') {
            const clientWorkflowId = await submit.run(containerClient, blobBaseName);
            await monitor.run(containerClient, clientWorkflowId);
        } else if (subcommand === 'submit') {
            const clientWorkflowId = await submit.run(containerClient, blobBaseName);
            core.setOutput('workflowId', clientWorkflowId);
        } else if (subcommand === 'monitor') {
            const clientWorkflowId = core.getInput('workflow-id');
            await monitor.run(containerClient, clientWorkflowId);
        } else {
            throw new Error(`Unknown subcommand: ${subcommand}`);
        }
    } catch (error) {
        console.error('Error in main script:', error);
        core.setFailed(error.message);
    }
}

run();
