import { isNil, isNotNil } from '../../common/helpers';

// Function to validate employee hours in a record
export const employeeHours = (record) => {
  try {
    // Get the values of relevant fields from the record
    const empType = record.get('employeeType');
    const defHours = record.get('defaultWeeklyHours');
    const schedHours = record.get('scheduledWeeklyHours');
    const message = 'Scheduled Weekly Hours calculated based on Employee Type';

    // Validate schedHours if it is a number and not nil
    if (typeof schedHours === 'number' && isNotNil(schedHours)) {
      if (schedHours > 168) {
        // Add an error if schedHours exceeds the maximum allowed hours
        record.addError(
          'scheduledWeeklyHours',
          'Scheduled Hours cannot exceed 168 hours'
        );
      }
    }

    // Validate defHours if it is a number and not nil
    if (typeof defHours === 'number' && isNotNil(defHours)) {
      if (defHours > 168) {
        // Add an error if defHours exceeds the maximum allowed hours
        record.addError(
          'defaultWeeklyHours',
          'Default Weekly Hours cannot exceed 168 hours'
        );
      }
    }

    // Add a warning if schedHours exceeds defHours but is within the allowed range
    if (schedHours > defHours && schedHours <= 168) {
      record.addWarning(
        'scheduledWeeklyHours',
        'Scheduled Hours exceeds Default Hours'
      );
    }

    // Set scheduledWeeklyHours and add info based on empType if schedHours is nil
    if (isNil(schedHours) && empType === 'ft') {
      record.set('scheduledWeeklyHours', 40);
      record.addInfo('scheduledWeeklyHours', message);
    }

    if (isNil(schedHours) && empType === 'pt') {
      record.set('scheduledWeeklyHours', 20);
      record.addInfo('scheduledWeeklyHours', message);
    }

    if (isNil(schedHours) && empType === 'tm') {
      record.set('scheduledWeeklyHours', 40);
      record.addInfo('scheduledWeeklyHours', message);
    }

    if (isNil(schedHours) && empType === 'ct') {
      record.set('scheduledWeeklyHours', 0);
      record.addInfo('scheduledWeeklyHours', message);
    }

    // Calculate and validate FTE if both defHours and schedHours are numbers and not nil
    if (
      typeof defHours === 'number' &&
      isNotNil(defHours) &&
      typeof schedHours === 'number' &&
      isNotNil(schedHours)
    ) {
      const fte = schedHours / defHours;

      if (fte > 999) {
        // Add an error if the calculated FTE exceeds the maximum allowed value
        record.addError(
          'scheduledWeeklyHours',
          `FTE must be 999 or less. FTE is calculated by dividing Scheduled Weekly Hours by Default Weekly Hours. Current FTE is ${fte}.`
        );
      }
    }
  } catch (error) {
    // If an error occurs during the validation, handle the error
    console.error(error);

    // Add an error message to the record indicating the error
    record.addError(
      'employeeId',
      `An error occurred while validating employee hours: ${error.message}`
    );
  }
};
