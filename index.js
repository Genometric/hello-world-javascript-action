const core = require('@actions/core');
const submit = require('./src/submit');
const monitor = require('./src/monitor');
const upload = require('./src/upload');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = {
    runCreateTask: submit.run
};

const accountNameENV = 'azure_storage_account_name';
const containerNameEnv = 'azure_storage_container_name';
const blobBaseNameEnv = 'azure_storage_blob_name';
const inputsContainerNameEnv = 'azure_storage_inputs_container_name';
const workflowPathEnv = 'workflow_path';
const inputsPathEnv = "workflow_inputs_path"
const dependenciesPathEnv = "workflow_dependencies_path";
const environmentVariables = [
    accountNameENV,
    containerNameEnv,
    blobBaseNameEnv,
    inputsContainerNameEnv,
    workflowPathEnv,
    inputsPathEnv,
    dependenciesPathEnv
];

function assertEnvVarsDefined(vars) {
    const undefinedVars = vars.filter(varName => !core.getInput(varName));

    if (undefinedVars.length > 0) {
        errorMessage = `The following environment variables are not defined: ${undefinedVars.join(', ')}`;
        core.setFailed(errorMessage);
        throw new Error(errorMessage);
    }
}

async function run() {
    assertEnvVarsDefined(environmentVariables);

    const accountName = core.getInput(accountNameENV);
    console.log("---1");

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );
    console.log("---2");

    const containerName = core.getInput(containerNameEnv);
    console.log("---3");
    const containerClient = blobServiceClient.getContainerClient(containerName);
    console.log("---4");
    const blobBaseName = core.getInput(blobBaseNameEnv);
    console.log("---5");

    try {
        const inputsContainerClient = blobServiceClient.getContainerClient(
            core.getInput(inputsContainerNameEnv));
        const workflowPath = await upload.run(core.getInput(workflowPathEnv), inputsContainerClient);
        const inputsPath = await upload.run(core.getInput(inputsPathEnv), inputsContainerClient);
        const dependenciesPath = await upload.run(core.getInput(dependenciesPathEnv), inputsContainerClient);

//        const subcommand = core.getInput('subcommand');
//        if (subcommand === 'synchronous') {
//            const clientWorkflowId = await submit.run(containerClient, blobBaseName, workflowPath, inputsPath, dependenciesPath);
//            await monitor.run(containerClient, clientWorkflowId);
//        } else if (subcommand === 'submit') {
//            const clientWorkflowId = await submit.run(containerClient, blobBaseName, workflowPath, inputsPath, dependenciesPath);
//            core.setOutput('workflowId', clientWorkflowId);
//        } else if (subcommand === 'monitor') {
//            const clientWorkflowId = core.getInput("workflow_id");
//            if (!clientWorkflowId) {
//                const msg = "workflow_id environment variable not defined.";
//                core.sefFailed(msg);
//                throw new Error(msg);
//            }
//            await monitor.run(containerClient, clientWorkflowId);
//        } else {
//            throw new Error(`Unknown subcommand: ${subcommand}`);
//        }
    } catch (error) {
        console.error('Error in main script:', error);
        core.setFailed(error.message);
    }
}

run();
