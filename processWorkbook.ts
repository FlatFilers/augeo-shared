import api from '@flatfile/api';

/*
 * Check if every record in the workbook has metadata with a 'processed' value of true.
 *
 * @param {workbookId} string - The workbookId to check.
 * @param {batchSize} number - The batch size to use when checking groups of records within a sheet.
 * @returns {boolean} True if all records have been processed, false otherwise.
 */

export default async function workbookProcessed(
  workbookId: string,
  batchSize: number
) {
  // Get all the sheets for @workbookId and create a list of their ids
  const sheets = await api.sheets.list({ workbookId });
  const sheetIds = sheets.data.map((sheet) => sheet.id);

  // Process each sheet
  const sheetsProcessed = await Promise.all(
    sheetIds.map(async (sheetId) => {
      // Get the records and calculate the number of sheets
      const recordCount = await api.sheets.getRecordCounts(sheetId);
      const numPages = Math.ceil(recordCount.data.counts.total / 1000);
      // Create an array of page to process, begin at index 1
      const pages = Array.from({ length: numPages }, (_, i) => i + 1);

      // Process page (ie batch of >= @batchSize records)
      return await Promise.all(
        pages.map(async (page) => {
          const records = await api.records.get(sheetId, {
            pageNumber: page,
            pageSize: batchSize,
          });

          // Test this batch of records by providing predicate value to .some(),
          // Return the result as the page batch
          return await records.data.records.some(
            (record) => record.metadata.processed === true
          );
        })
      );
    })
  );
  // Return true if every sheet (ie every record in that sheet) has been processed
  return sheetsProcessed.every((v) => v);
}
