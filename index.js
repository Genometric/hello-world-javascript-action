// dist/main.js
const core = require('@actions/core');
const submit = require('src/submit');

async function run() {
  try {
    const subcommand = core.getInput('subcommand');
    if (subcommand === 'synchronous') {
      await submit.run();
    } else {
      throw new Error(`Unknown subcommand: ${subcommand}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
