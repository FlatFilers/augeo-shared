// files.com SFTP source
//  -> implement API call to create Space in webhook script from files.com
//  -> api.spaces.create
//  -> each customer has a folder, company_id
//  -> create our space with the folder in metadata, and company_id as a secret on the Space
// listen for space:created
//  -> configure the space according to a specific customer's blueprint
//  -> using company_id (preferred) or folder, choose a blueprint
//  -> create a workbook from that customer's blueprint
//  -> fallback / default to a standard data model if nothing is specific to the customer
// upload the file
//  -> next step of our script from files.com awaits space creation and then uploads the file
//  -> api.files.create
// auto-extract the file
//  -> ensure we use Excel plugin
//  -> ephemeral workbook created
// auto-map when we have a mapping plan remembered
//  -> ensure we use Automap plugin
//  -> load data to our target workbook
// run record hooks conditionally based on [specific customer]
//  -> library of functions
// submit valid records to API endpoint in Augeo
//  -> generic function
//  -> POST data?company_id=***?target_env=folder
// fallback: action button to submit data
//  -> generic function built into Action
// when invalid records > 0, trigger internal notification 
//  -> Slack message



import { recordHook } from '@flatfile/plugin-record-hook';
import api from '@flatfile/api';
import { xlsxExtractorPlugin } from '@flatfile/plugin-xlsx-extractor';
import { submitData } from './actions/submitData';
import { blueprintSheets } from './blueprints/benefitsBlueprint';
import { benefitElectionsValidations } from './recordHooks/benefits/benefitElectionsValidations';
import { PipelineJobConfig, records } from '@flatfile/api/api';
import { FlatfileEvent } from '@flatfile/listener';
import { automap } from '@flatfile/plugin-automap';
import { RecordsResponse } from '@flatfile/api/api';
import { record } from 'io-ts';

// Define the main function that sets up the listener
export default function (listener) {
  // Log the event topic for all events
  listener.on('**', async (event: FlatfileEvent) => {
    console.log('> event.topic: ' + event.topic);
  });

  // Outside of Flatfile, a Space will get created. This responds with a spaceId
  // https://reference.flatfile.com/docs/api/25e20c8ab61c5-create-a-space
  // body: {
  //   "name": "",
  //   "environmentId": "[envId]",
  //   "metadata": { "folder": ""},
  //   "autoConfigure": true
  // }

  // When the Space has been created, we will also create a secret from the customer_id
  // https://reference.flatfile.com/docs/api/edf8fb7c887c6-upsert-a-secret
  // body: {
  //   "name": "customer_id",
  //   "value": "[customer_id]",
  //   "environmentId": "[envId]",
  //   "spaceId": "[spaceId]"
  // }


  // Add an event listener for the 'job:created' event
  listener.filter({ job: 'space:configure' }, (configure) => {
    configure.on('job:ready', async (event: FlatfileEvent) => {

      // Destructure the 'context' object from the event object to get the necessary IDs
      const { spaceId, environmentId, jobId } = event.context;

      // This gets the created SpaceId
      const space = await api.spaces.get(spaceId);

      // This acknowledges that Space creation has started in the UI
      const updateJob1 = await api.jobs.ack(jobId, {
        info: 'Creating Space',
        progress: 10,
      });

      // Create a workbook from the sheets object (our template / blueprint) that was imported
      try {
        // Create a new workbook using the Flatfile API
        const createWorkbook = await api.workbooks.create({
          spaceId: spaceId,
          environmentId: environmentId,
          labels: ['primary'],
          name: 'Benefits Workbook',
          sheets: blueprintSheets,
          actions: [
            {
              operation: 'submitAction',
              mode: 'foreground',
              label: 'Submit',
              type: 'string',
              description: 'Submit Data to HCM Show',
              primary: true,
            },
          ],
        });

        const workbookId = createWorkbook.data.id;
        if (workbookId) {
          // Update the space to set the primary workbook
          const updatedSpace = await api.spaces.update(spaceId, {
            environmentId: environmentId,
            primaryWorkbookId: workbookId,
            guestAuthentication: ['magic_link'],
            metadata: {
              // For testing, we're going to force-set our folder; this could also default to a staging environment in a production deploy
              folder: "folderId"
            },
          })
        }
        else {
          console.log('Unable to retrieve workbook ID from the response.');
        }
      } catch (error) {
        console.log('Error creating workbook or updating space:', error);
      }

      // Update the space creation job status to 'complete' using the Flatfile API
      const updateJob = await api.jobs.update(jobId, {
        status: 'complete',
      });
    });
    // Handle the 'job:failed' event
    configure.on('job:failed', async (event) => {
      console.log('Job Failed: ' + JSON.stringify(event));
    });
  });

  listener.use(
    automap({
      accuracy: 'confident'
    })
  );

  // Attach a record hook to the 'benefit-elections-sheet' of the Flatfile importer
  listener.use(
    // When a record is processed, invoke the 'benefitElectionsValidations' function to check for any errors
    recordHook('benefit-elections-sheet', (record, event) => {
      const results = benefitElectionsValidations(record);
      return record;
    })
  );

  listener.on('commit:created', async (event: FlatfileEvent) => {
    // get key identifiers, including destination sheet Id
    const { spaceId, sheetId, workbookId } = event.context;

    // catch to make sure all records have been processed before auto-submit
    const sheets = await api.sheets.list({ workbookId })
    let records:RecordsResponse;
    for (const [index, element] of sheets.data.entries()) {
      records[index] = await api.records.get(element.id);
      // TODO: Check metadata
      console.log(JSON.stringify(records,null,2))
      }
      
      // TODO: Get a list of successfully synced records IDs back
      // so we don't delete records that didn't sync.
      await submitData(event, workbookId, spaceId);

      console.log('Done');
    });

  // Listen for the 'submit' action
  listener.filter({ job: 'workbook:submitAction' }, (configure) => {
    configure.on('job:ready', async (event: FlatfileEvent) => {
      const { jobId, spaceId, workbookId } = event.context;
      let callback;

      try {
        await api.jobs.ack(jobId, {
          info: 'Sending data to HCM.show.',
          progress: 10,
        });

        try {
          // Call the submit function
          const callback = await submitData(event, workbookId, spaceId);

          // Log the action as a string to the console
        } catch (error) {
          // Handle the error gracefully, log an error message, and potentially take appropriate action
          console.log('Error occurred submission:', error);
          // Perform error handling, such as displaying an error message to the user or triggering a fallback behavior
        }

        if (callback.success) {
          await api.jobs.complete(jobId, {
            info: 'Data synced.',
          });
        }
      } catch (error) {
        console.error('Error:', error.stack);

        await api.jobs.fail(jobId, {
          info: 'The submit job did not run correctly.',
        });
      }
    });
  });

  // Attempt to parse XLSX files, and log any errors encountered during parsing
  try {
    listener.use(xlsxExtractorPlugin({ rawNumbers: true }));
  } catch (error) {
    console.error('Failed to parse XLSX files:', error);
  }
}
