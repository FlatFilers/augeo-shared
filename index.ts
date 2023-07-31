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



import { RecordHook } from '@flatfile/plugin-record-hook';
import api from '@flatfile/api';
import { xlsxExtractorPlugin } from '@flatfile/plugin-xlsx-extractor';
import { submitData } from './actions/submitData';
import { blueprintSheets } from './blueprints/benefitsBlueprint';
import { benefitElectionsValidations } from './recordHooks/benefits/benefitElectionsValidations';
import { FlatfileEvent } from '@flatfile/listener';
import { automap } from '@flatfile/plugin-automap';
import { RecordsResponse } from '@flatfile/api/api';

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

  // listener.use(
  //   automap({
  //     accuracy: 'confident',
  //     defaultTargetSheet: 'Benefit Elections'
  //   })
  // );

  listener.on('commit:created', async (event) => {
    try {
      // Retrieve the sheetId from the event context
      const sheetId = event.context.sheetId

      // Fetch the sheet from the API
      const sheet = await api.sheets.get(sheetId)

      // Only log that the sheet was fetched successfully
      if (!sheet) {
        console.log(`Failed to fetch sheet with id: ${sheetId}`)
        return
      }

      // Verify that the sheetSlug matches 'workers'
      if (sheet.data.config?.slug === 'benefit-elections-sheet') {
        console.log(
          "Confirmed: sheetSlug matches 'benefit-elections-sheet'. Proceeding to call RecordHook..."
        ) // Log before calling RecordHook

        // Get the fields from the sheet response
        const fields = sheet.data.config?.fields

        // Log only the number of fields retrieved
        if (!fields) {
          console.log('No fields were fetched.')
          return
        }
        console.log(`Successfully fetched ${fields.length} fields.`)

        // Call the RecordHook function with event and a handler
        await RecordHook(event, async (record, event) => {
          try {
            // Pass the fetched employees to the employeeValidations function along with the record
            await benefitElectionsValidations(record)
          } catch (error) {
            // Handle errors that might occur within employeeValidations
            console.error('Error in benefitElectionsValidations:', error)
          }
          // Clean up or perform any necessary actions after the try/catch block
          console.log("Exiting RecordHook's handler function") // Log when exiting the handler function
          return record
        })
        console.log('Finished calling RecordHook') // Log after calling RecordHook
      } else {
        console.log(
          "Failed: sheetSlug does not match 'benefit-elections-sheet'. Aborting RecordHook call..."
        )
      }
    } catch (error) {
      // Handle errors that might occur in the event handler
      console.error('Error in commit:created event handler:', error)
    }

    const { spaceId, workbookId } = event.context;
    // catch to make sure all records have been processed before auto-submit
    const sheets = await api.sheets.list({ workbookId });
    let records: RecordsResponse;
    let recordsSubmit: any
    for (const [index, element] of sheets.data.entries()) {
      const recordCount = await api.sheets.getRecordCounts(element.id);
      const pages = Math.ceil(recordCount.data.counts.total / 1000);
      console.log(JSON.stringify(pages))
      for (let i = 1; i <= pages; i++) {
        records = await api.records.get(element.id, { pageNumber: i });
        console.log(JSON.stringify(records,null,2));
        if (records.data.records.some((record) => !(record.metadata.processed == true))) {
          return
        };
        recordsSubmit = [...recordsSubmit, records.data.records]
      }
    }
    await submitData(event, workbookId, spaceId, recordsSubmit);

  })

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

        if (callback) {
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
