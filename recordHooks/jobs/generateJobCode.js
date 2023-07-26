import { FlatfileRecord } from '@flatfile/hooks';
import { isNil } from '../../common/helpers';

// Function to generate a job code based on the job name if the job code is nil
export const generateJobCode = (record) => {
  try {
    let jobCode = record.get('jobCode');
    let jobName = record.get('jobName');

    // Check if the job code is nil and the job name is not nil
    if (isNil(jobCode) && !isNil(jobName)) {
      // Generate job code based on job name
      jobCode = jobName.replace(/[,\s-]+/g, '_').replace(/&/g, 'and');

      // Set the generated job code in the record
      record.set('jobCode', jobCode);

      // Add an info message indicating that the job code has been automatically generated
      record.addInfo(
        'jobCode',
        'Job Code was not provided, this has been automatically generated for use in HCM Show'
      );
    }
  } catch (err) {
    console.log(err);

    // Add an error message to the record if an error occurs
    record.addError('jobCode', `An error occurred: ${err.message}`);
  }
};
