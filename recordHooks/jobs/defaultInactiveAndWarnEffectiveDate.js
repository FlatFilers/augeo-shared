import { FlatfileRecord } from '@flatfile/hooks';
import { isNil } from '../../common/helpers';

// Function to set default values for 'inactive' and add a warning for 'effectiveDate' if it is nil
export const defaultInactiveAndWarnEffectiveDate = (record) => {
  try {
    let inactive = record.get('inactive');

    // Set default value for 'inactive' if it is nil
    if (isNil(inactive)) {
      record.set('inactive', false);
      record.addInfo(
        'inactive',
        'Inactive was not provided. Field has been set to false.'
      );
    }

    let effectiveDate = record.get('effectiveDate');

    // Add a warning for 'effectiveDate' if it is nil
    if (isNil(effectiveDate)) {
      record.addWarning(
        'effectiveDate',
        `Effective Date is blank and will default to today's date in HCM Show`
      );
    }
  } catch (err) {
    console.error(err);

    // Add an error message to the record if an error occurs
    record.addError(
      'defaultInactiveAndWarnEffectiveDate',
      `An error occurred: ${err.message}`
    );
  }
};
