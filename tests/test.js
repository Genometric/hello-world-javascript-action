const { exec } = require('child_process');

process.env['INPUT_SUBCOMMAND'] = 'synchronous';
//process.env['INPUT_AZURE-STORAGE-ACCOUNT-NAME'] = '...';
//process.env['INPUT_AZURE-STORAGE-CONTAINER-NAME'] = '...';
//process.env['INPUT_AZURE-STORAGE-INPUTS-CONTAINER-NAME'] = '...';
//process.env['INPUT_AZURE-STORAGE-BLOB-NAME'] = '...';
process.env['INPUT_WORKFLOW-PATH'] = './tests/data/HelloWorld.wdl';
process.env['INPUT_WORKFLOW-INPUTS-PATH'] = './tests/data/HelloWorldInputs.json';
process.env['INPUT_WORKFLOW-DEPENDENCIES-PATH'] = './tests/data/dependencies.zip';


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
