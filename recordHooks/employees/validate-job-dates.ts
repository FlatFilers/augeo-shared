import { isNil, isNotNil } from '../../common/helpers'

// This function validates dates related to an employee's job, including the hire date,
// effective date of the job, job status, and employment end date for temp employees
export const validateJobDates = (record) => {
  try {
    // Get relevant fields from record
    const hireDate = record.get('hireDate')
    const endEmploymentDate = record.get('endEmploymentDate')
    const job = record.getLinks('jobName')
    const title = record.get('positionTitle')
    const empType = record.get('employeeType')

    // Get the effective date and inactive status of the job (if it exists)
    // `effDate` is the effective date of the job, or `null` if no job is linked to the record
    const effDate = isNotNil(job) ? job[0]?.effectiveDate : null

    // `inactive` is a boolean indicating if the linked job is currently inactive, or `null` if no job is linked to the record
    const inactive = isNotNil(job) ? job[0]?.inactive : null

    // Error if the termination date occurs before the employment date
    if (isNotNil(endEmploymentDate) && hireDate > endEmploymentDate) {
      const message =
        'The End Employment Date cannot be earlier than the Hire Date'
      record.addError('endEmploymentDate', message)
    }

    // Error if the effective date of job is after the hire date
    if (isNotNil(hireDate) && isNotNil(effDate) && effDate > hireDate) {
      const message = 'Effective Date of job cannot be after the Hire Date'
      record.addError('hireDate', message)
    }

    // Warning if job is currently inactive and no employment end date is provided
    if (isNotNil(job) && inactive && isNil(endEmploymentDate)) {
      const message = 'Job is currently inactive.'
      record.addWarning(['jobName'], message)
    }

    // If position title is not provided, set it to the job department name and add info message
    if (isNil(title) && isNotNil(job)) {
      const dept = job[0]?.jobDept
      record.set('positionTitle', dept)
      record.addInfo('positionTitle', 'Title defaulted to department name.')
    }

    // Error if temp employee does not have an employment end date
    if (empType === 'tm') {
      if (isNil(endEmploymentDate)) {
        const message = 'Temp Employees must have an Employment End Date'
        record.addError('endEmploymentDate', message)
      }
    } else {
      // Error if employment end date is provided for non-temp employee
      if (isNotNil(endEmploymentDate)) {
        const message = 'Employment End Date is only valid for Temp Employees'
        record.addError('endEmploymentDate', message)
      }
    }
  } catch (err) {
    // If an error occurs during execution of the function, add an error message to the record with the error details
    console.error(err)
    record.addError('employeeId', `An error occurred: ${err.message}`)
  }
}
