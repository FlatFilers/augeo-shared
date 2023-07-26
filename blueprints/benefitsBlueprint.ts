import { SheetConfig } from '@flatfile/api/api';

// Benefit Elections Sheet
const sheet: SheetConfig = {
  name: 'Benefit Elections',
  slug: 'benefit-elections-sheet',
  readonly: false,
  fields: [
    //Validate against exisitng Employess in DB. If not found, throw an error in Flatfile. Open question around whether this could be a ReferenceField with a lookup to the Employee table.  What should happen if an Emplpyee is not found?  Should we create a new Employee record in Flatfile or should that occur in HCM.Show?

    {
      key: 'employeeId',
      label: 'Employee ID',
      description: 'Employee ID for existing Employee in HCM.Show.',
      type: 'string',
      constraints: [{ type: 'required' }],
    },

    // Validate against exisitng benefit plans in DB. If not found, throw an error in Flatfile. Open question around whether this could be a ReferenceField with a lookup to the Benefit Plan table.  What should happen if a Benefit Plan is not found?  Should we create a new Benefit Plan record in Flatfile or should that occur in HCM.Show?

    {
      key: 'benefitPlan',
      label: 'Benefit Plan',
      description: 'Benefit Plan for existing Benefit Plan in HCM.Show.',
      type: 'string',
      constraints: [{ type: 'required' }],
    },

    //Required checkbox → “required: true” validation

    {
      key: 'currentlyEnrolled',
      label: 'Currently Enrolled',
      description: 'Is the employee currently enrolled in this benefit plan?',
      type: 'boolean',
      constraints: [{ type: 'required' }],
    },

    //Date fields have a date format selection → updated target date format for SmartDateField

    {
      key: 'coverageStartDate',
      label: 'Coverage Start Date',
      description:
        'Date coverage begins for this benefit plan. Must be formatted as yyyy-MM-dd',
      type: 'date',
      constraints: [{ type: 'required' }],
    },

    //Round to two decimal places → validation / compute on Number fields for decimal places (trim and validate)

    {
      key: 'employerContribution',
      label: 'Employer Contribution',
      type: 'string',
      description:
        'Employer contribution for this benefit plan per plan frequency.',
      constraints: [{ type: 'required' }],
    },

    {
      key: 'benefitCoverageType',
      label: 'Benefit Coverage Type',
      type: 'enum',
      description:
        'Indicates the type of insurance, retirement savings, or other benefits that are provided by an employer to an employee.',
      constraints: [{ type: 'required' }],
      config: {
        options: [
          {
            value: 'Insurance_Coverage_Type_Insurance',
            label: 'Insurance',
          },

          {
            value: 'Health_Care_Coverage_Type_Medical',
            label: 'Medical',
          },
          {
            value: 'Health_Care_Coverage_Type_Dental',
            label: 'Dental',
          },
          {
            value: 'Retirement_Savings_Coverage_Type_Retirement',
            label: 'Retirement',
          },
          {
            value: 'Additional_Benefits_Coverage_Type_Other',
            label: 'Other',
          },
        ],
      },
    },
  ],
};

export const blueprintSheets = [{ ...sheet }];
