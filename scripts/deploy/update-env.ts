const path = require('path');
const fs = require('fs');
import { WorkflowEnvironment, WorkflowType } from './types';
import workflowEnvs from './workflow-envs';

if (process.argv.length < 4) {
  console.error(
    'Missing arguments: npm run update-env <production|dev> <onboarding|filefeed|embedded|dynamic>'
  );
  process.exit(1);
}

const environment = process.argv[2];
const workflowName = process.argv[3];

if (!workflowEnvs[environment] || !workflowEnvs[environment][workflowName]) {
  console.error(
    `No workflow found with environment '${environment}' and workflow '${workflowName}'`
  );
  process.exit(1);
}

const config =
  workflowEnvs[environment as WorkflowEnvironment][
    workflowName as WorkflowType
  ];

if (
  !config.apiKey ||
  config.apiKey.includes('...') ||
  !config.environmentId ||
  config.environmentId.includes('...')
) {
  console.error(
    `scripts/deploy/workflow-envs.ts is missing API key or environment ID for environment '${environment}' and workflow '${workflowName}'`
  );
  process.exit(1);
}

console.log('Updating API key and environment ID in .env...');

const envContent = `FLATFILE_API_KEY=${config.apiKey}\nFLATFILE_ENVIRONMENT=${config.environmentId}`;

fs.writeFile(path.join('.env'), envContent, (err) => {
  if (err) {
    console.error('Error writing to .env:', err);
    return;
  }
  console.log('Updated .env');
});
