import { isNil, isNotNil } from '../../common/helpers';
import { parseFullName } from 'parse-full-name';

// Helper function to trim any leading/trailing spaces and replace multiple spaces between words with a single space
function cleanName(name) {
  if (name === null || name === undefined) {
    return '';
  }
  return name.trim().replace(/\s+/g, ' ');
}

// Function to build a full name by concatenating first and last names, provided they are not empty
export function concatenateNames(record) {
  try {
    console.log('Starting name concatenation...');

    // Retrieve full, first and last names from the record
    console.log('Retrieving names info...');
    let full = record.get('fullName');
    let first = record.get('firstName');
    let last = record.get('lastName');

    // Trim spaces from the full, first, and last names and replace multiple spaces with a single one
    console.log('Cleaning names...');
    full = cleanName(full);
    first = cleanName(first);
    last = cleanName(last);

    // If full name is missing but first and last names are present and not empty, concatenate first and last names
    console.log('Concatenating names...');
    if (
      (isNil(full) || full === '') &&
      isNotNil(first) &&
      first !== '' &&
      isNotNil(last) &&
      last !== ''
    ) {
      record.set('fullName', `${first} ${last}`);
      record.addInfo(
        'fullName',
        `Full Name was missing or empty. It has been filled by concatenating the provided First Name: '${first}' and Last Name: '${last}'.`
      );
    }

    console.log('Finished name concatenation.');
  } catch (error) {
    console.log('Error occurred during name concatenation:', error);
  }
}

// Function to parse a full name into first and last names, but only if they are both missing
export function splitFullName(record) {
  try {
    console.log('Starting name splitting...');
    const full = record.get('fullName');
    let first = record.get('firstName');
    let last = record.get('lastName');

    // Check if first and last names are missing or empty
    if (
      isNotNil(full) &&
      (isNil(first) || first === '') &&
      (isNil(last) || last === '')
    ) {
      // Parse the full name into first and last names
      console.log('Parsing full name...');
      const parsedName = parseFullName(full);

      const firstName = parsedName.first;
      const lastName = parsedName.last;

      // Set the first and last names based on the parsed full name
      console.log('Setting name fields...');
      record.set('firstName', firstName);
      record.addInfo(
        'firstName',
        `First Name was missing or empty. It has been extracted from the provided Full Name: '${full}'.`
      );
      record.set('lastName', lastName);
      record.addInfo(
        'lastName',
        `Last Name was missing or empty. It has been extracted from the provided Full Name: '${full}'.`
      );
    }

    console.log('Finished name splitting.');
  } catch (error) {
    console.log('Error occurred during name splitting:', error);
  }
}
