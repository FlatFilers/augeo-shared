import { FlatfileRecord } from '@flatfile/hooks';

// Function to round the currency values of specified fields in a FlatfileRecord
export const roundCurrencyValues = (record, fields) => {
  // Loop over each field in the fields array
  fields.forEach((field) => {
    try {
      // Retrieve the field's value from the record
      const fieldValue = record.get(field);

      // Validate if the field value is a numeric value
      if (!isNaN(parseFloat(fieldValue)) && isFinite(fieldValue)) {
        // Convert the field value to a numeric value and round it to the nearest 2 decimal places
        const roundedValue = parseFloat(fieldValue).toFixed(2);

        // Check if the original field value needs rounding
        if (fieldValue !== roundedValue) {
          // Update the original field value with the rounded value in the record
          record.set(field, roundedValue);

          // Add an informative message to the record indicating the value has been rounded
          record.addInfo(
            field,
            `${field} has been rounded to 2 decimal places.`
          );
        }
      } else if (fieldValue !== null && fieldValue !== undefined) {
        // If the field value is populated but not numeric, add an error to the record.
        // The error message instructs the user to ensure they enter a valid numeric value, using a dot (.) as a decimal separator.
        record.addError(
          field,
          `The field "${field}" should be a number. Please enter a valid numeric value, using a dot (.) as a decimal separator.`
        );
      }
    } catch (err) {
      // Handle any error that occurs during the rounding process and log it
      console.log(err);

      // Add an error message to the record indicating an error occurred during rounding
      record.addError(
        field,
        `An error occurred while rounding: ${err.message}`
      );
    }
  });

  // Return the record after applying rounding and validations to all specified fields
  return record;
};
