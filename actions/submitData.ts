import { post } from '../common/utils/request';
import { FlatfileEvent } from '@flatfile/listener';
import { SpaceId, WorkbookId, RecordsResponse } from '@flatfile/api/api';
import api from '@flatfile/api';

// Submit function should send all valid data
// GraphQL reponse will contain success and error response

// Function to push data to a webhook
export async function submitData(
  event: FlatfileEvent,
  workbookId: WorkbookId,
  spaceId: SpaceId,
  recordsSubmit?: any
) {
  if (!recordsSubmit) {
    const sheets = await api.sheets.list({ workbookId });
    let records: RecordsResponse;
    let recordsSubmit: any
    for (const [index, element] of sheets.data.entries()) {
      const pages = Math.ceil(element.countRecords.total / 1000);
      for (let i = 1; i <= pages; i++) {
        records = await api.records.get(element.id, { pageNumber: i });
        if (records.data.records.some((record) => !(record.metadata.processed == true))) {
          console.log('Some records have not been processed through validations.')
          return
        }
        recordsSubmit = [...recordsSubmit, records.data.records]
      }
    }
  }

  // Getting the metadata from the Space
  const space = await api.spaces.get(spaceId)
  const { metadata } = space.data.metadata

  // Placeholder here for fetching a Secret from the event
  // For testing - we will hardcode these to see the values pass through in the webhook
  // const customerId = await event.secrets("customer_id");
  // const apiKey = await event.secrets("api_key");
  // const apiSecret = await event.secrets("api_secret");
  const customerId = "customer_id";
  const apiKey = "api_key";
  const apiSecret = "api_secret";

  // Making a POST request to webhook site
  // This would be updated with your own API endpoints
  const response = await post({
    hostname: 'webhook.site',
    path: `/57b05d59-0b25-4c1d-937e-f892b83f2771`,
    body: { metadata, customerId, apiKey, apiSecret, recordsSubmit },
  });

  // const { success, failure } = response.data
  // forEach(success.record) => delete from workbook
  // forEach(failure.record) => add error message to record
};
