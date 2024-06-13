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

    try {
        const subcommand = core.getInput('subcommand');
        if (subcommand === 'synchronous') {
            const clientWorkflowId = await submit.run(containerClient);
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
