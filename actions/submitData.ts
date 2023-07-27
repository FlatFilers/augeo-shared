import { post } from '../common/utils/request';
import { FlatfileEvent } from '@flatfile/listener';
import { SpaceId, WorkbookId } from '@flatfile/api/api';
import api from '@flatfile/api';

// Function to push data to a webhook
export async function submitData(
  event: FlatfileEvent,
  workbookId: WorkbookId,
  spaceId: SpaceId
) {
  //get all sheets
  const sheets = await api.sheets.list({ workbookId })

  // get all records from sheets
  // TODO: add filtering as desired
  const records = {};
  for (const [index, element] of sheets.data.entries()) {
    records[`Sheet[${index}]`] = await api.records.get(element.id);

    // Getting the metadata from the Space
    const space = await api.spaces.get(spaceId)
    const { metadata } = space.data.metadata

    // Placeholder here for fetching a Secret from the event
    // Fort testing - we will hardcode these to see the values pass through in the webhook
    // const customerId = await event.secrets("customer_id");
    // const apiKey = await event.secrets("api_key");
    // const apiSecret = await event.secrets("api_secret");
    const customerId = "customer_id";
    const apiKey = "api_key";
    const apiSecret = "api_secret";

    // Making a POST request to webhook site
    // This would be updated with your own API endpoints
    return await post({
      hostname: 'webhook.site',
      path: `/57b05d59-0b25-4c1d-937e-f892b83f2771`,
      body: { metadata, customerId, apiKey, apiSecret, records },
    });
  };
};
