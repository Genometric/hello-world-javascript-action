const core = require('@actions/core');

async function runWorkflowAsync(containerClient, clientWorkflowId) {
    const failedBlobPrefix = `failed/${clientWorkflowId}`;
    const succeededBlobPrefix = `succeeded/${clientWorkflowId}`;

    // 30 seconds
    const waitInterval = 30000;

    let isDone = false;
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

            console.log(`The workflow is running, will recheck in ${waitInterval} seconds.`);
        } catch (error) {
            console.log(`Error occurred; will retry in 30s.  ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, waitInterval));
    }
}

async function run(containerClient, clientWorkflowId) {
    try {
        await runWorkflowAsync(containerClient, clientWorkflowId);
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
};

exports.run = run;
