const { exec } = require('child_process');

process.env['INPUT_SUBCOMMAND'] = 'synchronous';
//process.env['INPUT_AZURE_STORAGE_ACCOUNT_NAME'] = '...';
//process.env['INPUT_AZURE_STORAGE_CONTAINER_NAME'] = '...';
//process.env['INPUT_AZURE_STORAGE_INPUTS_CONTAINER_NAME'] = '...';
//process.env['INPUT_AZURE_STORAGE_BLOB_NAME'] = '...';
process.env['INPUT_WORKFLOW_PATH'] = './tests/data/HelloWorld.wdl';
process.env['INPUT_WORKFLOW_INPUTS_PATH'] = './tests/data/HelloWorldInputs.json';
process.env['INPUT_WORKFLOW_DEPENDENCIES_PATH'] = './tests/data/dependencies.zip';


//exec('node dist/index.js', (error, stdout, stderr) => {
exec('node index.js', (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    if (stderr) {
        console.error('stderr:', stderr);
        return;
    }
    console.log('stdout:', stdout);
});
