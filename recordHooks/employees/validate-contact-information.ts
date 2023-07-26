import EmailValidator from 'email-validator'
import { isNotNil, isNil } from '../../common/helpers'

const validateContactInfo = (record) => {
  try {
    const emailAddress = record.get('emailAddress')
    const phoneNumber = record.get('phoneNumber')

    if (isNil(phoneNumber) && isNil(emailAddress)) {
      // If both fields are null or undefined, add an error message to the record indicating that one of the fields is required
      const message =
        'One of the following contact methods is required: Phone Number or Email Address!'
      record.addError('phoneNumber', message)
      record.addError('emailAddress', message)
    } else {
      // If emailAddress field exists
      if (isNotNil(emailAddress)) {
        // Use the EmailValidator library to check if the email address is in a valid format
        const isValid = EmailValidator.validate(emailAddress)

        // If the email address is not valid, add an error message to the record
        if (!isValid) {
          record.addError(
            'emailAddress',
            "Email addresses must be in the format of 'xxx@yy.com'. Valid examples: john.doe@aol.com, jane@aol.com."
          )
        }
      } else {
        // If the email address is null or undefined, add a warning message to the record indicating that the field is recommended
        record.addWarning(
          'emailAddress',
          'Email Address is recommended for HCM Show functionality.'
        )
      }
    }
  } catch (error) {
    // If an exception occurs during execution of the function, add an error message to the record with the error details
    record.addError(
      'emailAddress',
      `Error validating contact information: ${error.message}`
    )
  }
}

export default validateContactInfo
