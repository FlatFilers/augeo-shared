export const dedupeEmployees = (records) => {
  const uniques = {}; // Object to store unique records based on employeeId
  const removeThese = []; // Array to store record IDs to be removed

  for (const record of records) {
    const employeeId = record.values.employeeId.value; // Get the employeeId value from the record

    if (typeof employeeId === 'string') {
      // Check if the employeeId is of type string
      if (!(employeeId in uniques)) {
        // If the employeeId is not found in the uniques object, add the record as a unique record
        uniques[employeeId] = record;
      } else {
        // If the employeeId is already in the uniques object, compare hire dates to determine which record to keep
        const latestRecord = uniques[employeeId];

        if (record.values.hireDate.value > latestRecord.values.hireDate.value) {
          // If the current record has a later hire date, remove the latestRecord and add the current record
          removeThese.push(latestRecord.id);
          uniques[employeeId] = record;
        } else {
          // If the current record has an earlier or equal hire date, add the current record to the removal list
          removeThese.push(record.id);
        }
      }
    } else {
      console.log('Invalid employeeId:', employeeId); // Log an error message for invalid employeeId values
    }
  }

  return removeThese; // Return the list of record IDs to be removed
};
