const core = require('@actions/core');
const submit = require('./src/submit');
const monitor = require('./src/monitor');
const upload = require('./src/upload');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = {
    runCreateTask: submit.run
};

async function run() {
    const accountName = core.getInput('azure_storage_account_name');
    if (!accountName) {
        core.setFailed('Azure Storage accountName not found');
        return;
    }

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );

    const containerName = core.getInput('azure_storage_container_name');
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobBaseName = core.getInput('azure_storage_blob_name');

    try {
        const inputsContainerClient = blobServiceClient.getContainerClient(
            core.getInput('azure_storage_inputs_container_name'));
        const workflowPath = await upload.run(core.getInput("workflow_path"), inputsContainerClient);
        const inputsPath = await upload.run(core.getInput("workflow_inputs_path"), inputsContainerClient);
        const dependenciesPath = await upload.run(core.getInput("workflow_dependencies_path"), inputsContainerClient);

        const subcommand = core.getInput('subcommand');
        if (subcommand === 'synchronous') {
            const clientWorkflowId = await submit.run(containerClient, blobBaseName, workflowPath, inputsPath, dependenciesPath);
            await monitor.run(containerClient, clientWorkflowId);
        } else if (subcommand === 'submit') {
            const clientWorkflowId = await submit.run(containerClient, blobBaseName, workflowPath, inputsPath, dependenciesPath);
            core.setOutput('workflowId', clientWorkflowId);
        } else if (subcommand === 'monitor') {
            const clientWorkflowId = core.getInput('workflow_id');
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
