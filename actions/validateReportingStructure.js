export const validateReportingStructure = (records) => {
  const reportingErrors = []; // Array to store records with reporting errors
  const employees = {}; // Object to store employee records by employeeId
  const visited = new Set(); // Set to keep track of visited employeeIds
  const managerIds = new Set(); // Set to store unique managerIds
  const employeesWithManagerId = new Set(); // Set to store employeeIds where employeeId = managerId

  // Recursive function to detect circular dependencies in the reporting structure
  const detectCircularDependency = (employeeId, path) => {
    if (visited.has(employeeId)) {
      // Circular dependency detected for employeeId
      const record = employees[employeeId];
      record.values.employeeId.messages.push({
        message: `Circular dependency detected: ${path.join(
          ' -> '
        )} -> ${employeeId}`,
        source: 'custom-logic',
        type: 'error',
      });
      reportingErrors.push(record);
      return;
    }

    visited.add(employeeId);
    const managerId = employees[employeeId]?.values.managerId.value;

    if (managerId && managerId !== employeeId) {
      // Recursive call to detect circular dependency for the managerId
      detectCircularDependency(managerId, [...path, employeeId]);
    }

    visited.delete(employeeId);
  };

  // Iterating over the records to validate the reporting structure
  for (const record of records) {
    const employeeId = record.values.employeeId.value;
    const managerId = record.values.managerId.value;

    employees[employeeId] = record;

    if (managerId && managerId !== '') {
      // Adding managerId to the set of unique managerIds
      managerIds.add(managerId);

      if (employeeId === managerId) {
        // Add employeeId to the set of employeeIds where employeeId = managerId
        employeesWithManagerId.add(employeeId);
      }
    }
  }

  // Add error message to records where employeeId = managerId and more than one record has this scenario
  if (employeesWithManagerId.size > 1) {
    for (const employeeId of employeesWithManagerId) {
      const record = employees[employeeId];
      record.values.employeeId.messages.push({
        message: `Multiple records have the scenario where employeeId = managerId. Please ensure that only one record has the employeeId = managerId scenario.`,
        source: 'custom-logic',
        type: 'error',
      });
      reportingErrors.push(record);
    }
  }

  // Validating managerIds and checking if they exist as employees
  for (const record of records) {
    const employeeId = record.values.employeeId.value;
    const managerId = record.values.managerId.value;

    if (managerId && managerId !== '' && !employees[managerId]) {
      // Manager with managerId does not exist as an employee
      record.values.managerId.messages.push({
        message: `Manager with ID: ${managerId} does not exist as an employee`,
        source: 'custom-logic',
        type: 'error',
      });
      reportingErrors.push(record);
    }
  }

  // Checking for circular dependencies in the reporting structure
  for (const employeeId in employees) {
    if (!visited.has(employeeId)) {
      // Start detecting circular dependencies from unvisited employeeId
      detectCircularDependency(employeeId, []);
    }
  }

  console.log('Reporting Errors: ' + JSON.stringify(reportingErrors));

  return reportingErrors;
};
