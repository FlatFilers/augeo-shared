import { recordHook } from '@flatfile/plugin-record-hook';
import api from '@flatfile/api';
import { xlsxExtractorPlugin } from '@flatfile/plugin-xlsx-extractor';
import { pushToHcmShow } from '../../actions/pushToHCMShow';
import { blueprintSheets } from '../../blueprints/benefitsBlueprint';
import { benefitElectionsValidations } from '../../recordHooks/benefits/benefitElectionsValidations';
import { FlatfileEvent } from '@flatfile/listener';

type Metadata = {
  userId: string;
};

// Define the main function that sets up the listener
export default function (listener) {
  // Log the event topic for all events
  listener.on('**', (event) => {
    console.log('> event.topic: ' + event.topic);
  });

  // Add an event listener for the 'job:created' event
  listener.filter({ job: 'space:configure' }, (configure) => {
    configure.on('job:ready', async (event) => {
      console.log('Reached the job:ready event callback');

      // Destructure the 'context' object from the event object to get the necessary IDs
      const { spaceId, environmentId, jobId } = event.context;

      const space = await api.spaces.get(spaceId);

      console.log('Space: ' + JSON.stringify(space));

      const metadata = space.data.metadata as Metadata;

      const userId = metadata?.userId;

      const updateJob1 = await api.jobs.ack(jobId, {
        info: 'Creating Space',
        progress: 10,
      });

      console.log('Updated Job: ' + JSON.stringify(updateJob1));

      // Log the environment ID to the console
      console.log('env: ' + environmentId);
      console.log('spaceId ' + spaceId);
      console.log('jobID: ' + jobId);

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
          console.log('Created Workbook with ID:' + workbookId);

          // Update the space to set the primary workbook and theme using api.spaces.update
          const updatedSpace = await api.spaces.update(spaceId, {
            environmentId: environmentId,
            primaryWorkbookId: workbookId,
            metadata: {
              userId,
              sidebarConfig: {
                showSidebar: true,
                // This property seems to break guest magic link functionality?
                // showGuestInvite: true,
              },
              // IMPORTANT NOTE: The theme set below does not effect change in the embedded workflow. This is a copy of the theme settings.
              // To change the theme in the embedded workflow, you must set the theme in the HCM.Show application within the props of useSpace.
              // If you do change the theme settings in the HCM.Show application, please update the theme settings here to match.
              theme: {
                root: {
                  primaryColor: '#32A673',
                  warningColor: '#FF9800',
                },
                sidebar: {
                  logo: `https://images.ctfassets.net/e8fqfbar73se/4c9ouGKgET1qfA4uxp4qLZ/e3f1a8b31be67a798c1e49880581fd3d/white-logo-w-padding.png`,
                  textColor: '#FFFFFF',
                  titleColor: '#FFFFFF',
                  focusBgColor: '#4DCA94',
                  focusTextColor: '#FFFFFF',
                  backgroundColor: '#32A673',
                  footerTextColor: '#FFFFFF',
                  textUltralightColor: '#FF0000',
                },
                table: {
                  inputs: {
                    radio: {
                      color: 'rgb(8 117 225)',
                    },
                    checkbox: {
                      color: 'rgb(8 117 225)',
                    },
                  },
                  filters: {
                    color: '#808080',
                    active: {
                      backgroundColor: 'rgb(8 117 225)',
                    },
                    error: {
                      activeBackgroundColor: '#FA8072',
                    },
                  },
                  column: {
                    header: {
                      fontSize: '12px',
                      backgroundColor: 'rgb(240 240 240)',
                      color: '#678090',
                      dragHandle: {
                        idle: 'rgb(8 117 225)',
                        dragging: '#0000FF',
                      },
                    },
                  },
                  fontFamily: 'Arial',
                  indexColumn: {
                    backgroundColor: 'rgb(240 240 240)',
                    selected: {
                      color: 'rgb(240 240 240)',
                      backgroundColor: 'rgb(200 200 200)',
                    },
                  },
                  cell: {
                    selected: {
                      backgroundColor: 'rgb(235 245 255)',
                    },
                    active: {
                      borderColor: 'rgb(8 117 225)',
                      spinnerColor: '#808080',
                    },
                  },
                  boolean: {
                    toggleChecked: 'rgb(240 240 240)',
                  },
                  loading: {
                    color: 'rgb(240 240 240)',
                  },
                },
              },
            },
          });

          // Log the ID of the updated space to the console
          console.log('Updated Space with ID: ' + updatedSpace.data.id);
        } else {
          console.log('Unable to retrieve workbook ID from the response.');
        }
      } catch (error) {
        console.log('Error creating workbook or updating space:', error);
      }

      // IMPORTANT NOTE: The document created below does not effect change in the embedded workflow. This is a copy of the document layout.
      // To change the document in the embedded workflow, you must set the document in the HCM.Show application within the props of useSpace.
      // If you do change the theme settings in the HCM.Show application, please update the theme settings here to match.
      const createDoc = await api.documents.create(spaceId, {
        title: 'Welcome',
        body: `<div> 
        <h1 style="margin-bottom: 36px;">Welcome! We're excited to help you import your data to HCM Show.</h1>
        <h2 style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below to get started:</h2>
        <h2 style="margin-bottom: 0px;">1. Upload your file</h2>
        <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar, and upload the sample data you want to import into Flatfile. You can do this by clicking "Add files" or dragging and dropping the file onto the page.</p>
        <h2 style="margin-bottom: 0px;">2. Import the Benefit Elections Data</h2>
        <p style="margin-top: 0px; margin-bottom: 8px;">Click "Import" and select the benefit elections data. Follow the mapping instructions in Flatfile to complete the import. Once the data has been mapped, it will be loaded into Flatfile's table UI, where validations and transformations have been applied.</p>
        <h2 style="margin-bottom: 0px;">3. Validate and Transform Data</h2>
        <p style="margin-top: 0px; margin-bottom: 8px;">Make sure to verify that your data is correctly formatted and transformed by Flatfile. Flatfile will handle formatting dates, rounding amounts, and validating the existence of employees and benefit plans for you! If there are any issues or errors, you can easily address them within Flatfile's user interface.</p>
        <h2 style="margin-bottom: 0px;">4. Load Data into HCM.Show</h2>
        <p style="margin-top: 0px; margin-bottom: 12px;">Once the data has been validated and transformed, use the “Push records to HCM.show” button to load data into the HCM.Show application.</p>
        <h2 style="margin-bottom: 0px;">5. Return to HCM.Show</h2>
        <p style="margin-top: 0px; margin-bottom: 36px;">Once you have loaded the data from Flatfile to HCM Show, return to HCM.Show and navigate to the Data Templates section within the application to view the benefit elections data that you have just loaded.</p>
        <h3 style="margin-top: 0px; margin-bottom: 12px;">Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
      </div>`,
      });

      console.log('Created Document: ' + createDoc);

      // Update the job status to 'complete' using the Flatfile API
      const updateJob = await api.jobs.update(jobId, {
        status: 'complete',
      });

      // Log the result of the updateJob function to the console as a string
      console.log(
        'Updated Job With ID to Status Complete: ' + updateJob.data.id
      );
    });

    // Handle the 'job:failed' event
    configure.on('job:failed', async (event) => {
      console.log('Job Failed: ' + JSON.stringify(event));
    });
  });

  // Attach a record hook to the 'benefit-elections-sheet' of the Flatfile importer
  listener.use(
    // When a record is processed, invoke the 'jobValidations' function to check for any errors
    recordHook('benefit-elections-sheet', (record) => {
      const results = benefitElectionsValidations(record);
      // Log the results of the validations to the console as a JSON string
      console.log('Benefits Hooks: ' + JSON.stringify(results));
      // Return the record, potentially with additional errors added by the 'benefitValidations' function
      return record;
    })
  );

  // Listen for the 'submit' action
  listener.filter({ job: 'workbook:submitAction' }, (configure) => {
    configure.on('job:ready', async (event: FlatfileEvent) => {
      const { jobId, spaceId } = event.context;
      try {
        await api.jobs.ack(jobId, {
          info: 'Sending data to HCM.show.',
          progress: 10,
        });

        let callback;
        try {
          // Call the submit function with the event as an argument to push the data to HCM Show
          const sendToShowSyncSpace = await pushToHcmShow(event, 'embed');
          callback = JSON.parse(sendToShowSyncSpace);

          // Log the action as a string to the console
          console.log('Action: ' + JSON.stringify(event?.payload?.operation));
        } catch (error) {
          // Handle the error gracefully, log an error message, and potentially take appropriate action
          console.log('Error occurred during HCM workbook submission:', error);
          // Perform error handling, such as displaying an error message to the user or triggering a fallback behavior
        }

        if (callback.success) {
          await api.jobs.complete(jobId, {
            info: 'Data synced to the HCM.show app.',
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
