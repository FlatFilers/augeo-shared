import { formatRecordDates } from '../../common/dateFormatting';
import { roundCurrencyValues } from './roundCurrencyValues';
import { validateBooleanFields } from '../../common/validateBooleanFields';
import { FlatfileRecord } from '@flatfile/hooks';


export function benefitElectionsValidations(record:FlatfileRecord) {
  // The function expects a 'record' object. If the input is not a valid object, it throws an error.
  if (!record || typeof record !== 'object') {
    throw new Error(
      'Invalid input. The function expects a valid record object.'
    );
  }

  try {
    formatRecordDates(record, 'benefit-elections-sheet');
  } catch (error) {
    console.log('Error occurred during date formatting:', error);
    // Handle or rethrow the error as needed
  }

  try {
    // The 'validateBooleanFields' function is used to ensure the boolean fields within the 'benefit-elections-sheet' are valid.
    validateBooleanFields(record, 'benefit-elections-sheet');
  } catch (error) {
    console.log('An error occurred during boolean field validation:', error);
    // If an error occurs during the validation of boolean fields, it is logged. Depending on your requirements,
    // you may wish to handle this error in a different way or rethrow the error.
  }

  try {
    // The 'roundCurrencyValue' function is used to round the 'employerContribution' field within the record to 2 decimal places.
    roundCurrencyValues(record, ['employerContribution']);
  } catch (error) {
    console.log(
      'An error occurred during rounding of employer contribution:',
      error
    );
    // If an error occurs during the rounding of employer contribution, it is logged. Depending on your requirements,
    // you may wish to handle this error in a different way or rethrow the error.
  }

  const metadata = {processed: true}
  record.setMetadata(metadata)

  // Returns the validated and possibly modified record.
  return record;
}