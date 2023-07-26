import { FlatfileRecord } from '@flatfile/hooks';
import { blueprintSheets as hcmBlueprintSheets } from '../blueprints/hcmBlueprint';
import { blueprintSheets as benefitsBlueprintSheets } from '../blueprints/benefitsBlueprint';
import { isNotNil } from './helpers';

// Combine both blueprints
const combinedBlueprints = [...hcmBlueprintSheets, ...benefitsBlueprintSheets];

// Function to validate boolean fields in a record
function validateBooleanFields(record, sheetSlug) {
  // Find the sheet object with the given slug in the combined blueprints
  const sheet = combinedBlueprints.find((sheet) => sheet.slug === sheetSlug);

  // Filter the fields of type 'boolean' and get their keys
  const booleanFields = sheet.fields
    .filter((field) => field.type === 'boolean')
    .map((field) => field.key);

  // Define the commonly used synonyms for boolean values
  const synonyms = {
    true: true,
    yes: true,
    y: true,
    on: true,
    false: false,
    no: false,
    n: false,
    off: false,
  };

  // Iterate over each boolean field
  booleanFields.forEach((booleanField) => {
    // Get the value of the boolean field from the record
    let value = record.get(booleanField);

    // Check if the value is a string and is present in the synonyms object
    if (typeof value === 'string' && value.toLowerCase() in synonyms) {
      // Map the synonym to its corresponding boolean value
      const mappedValue = synonyms[value.toLowerCase()];
      // Set the mapped value back to the record
      record.set(booleanField, mappedValue);
      // Add an info message indicating the mapping
      record.addInfo(booleanField, `Value "${value}" mapped to ${mappedValue}`);
    } else if (isNotNil(value) && typeof value !== 'boolean') {
      // If the value is not a boolean and not a valid synonym, add an error to the record
      record.addError(booleanField, 'This field must be a boolean');
    }
  });
}

// Export the validateBooleanFields function for use in other modules
export { validateBooleanFields };
