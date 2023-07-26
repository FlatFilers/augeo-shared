import { dedupeEmployees } from '../actions/dedupe.js';
import RecordsWithLinks from '@flatfile/api';

describe('Employees', () => {
  it('dedupeEmployees', () => {
    // Mocked inbound records from the Flatfile API response
    const inbound = [
      {
        id: 'us_rc_HrMVtwH6MxYWG7KsChqcZuIlzeJdAYGT',
        values: {
          employeeId: {
            value: '21001',
            valid: false,
            messages: [
              {
                message: 'employeeId must be unique',
                source: 'unique-constraint',
                type: 'error',
              },
            ],
          },
          managerId: {
            value: '21005',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Logan',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'McNeil',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-01',
            valid: false,
            messages: [
              {
                type: 'error',
                source: 'custom-logic',
                message: 'Effective Date of job cannot be after the Hire Date',
              },
            ],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Vice President, Human Resources',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Vice_President_Human_Resources',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Vice President, Human Resources',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'lmcneil@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(415) 441-7842',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
      {
        id: 'us_rc_qel4bvKT3gvRzG1rUo4EVbqdYKdIvzaz',
        values: {
          employeeId: {
            value: '21002',
            valid: true,
            messages: [],
          },
          managerId: {
            value: '21002',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Steve',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'Morgan',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-01',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'Date has been formatted as yyyy-MM-dd',
              },
            ],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Chief Executive Officer',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Chief_Executive_Officer',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Chief Executive Officer',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'smorgan@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(510) 635-1856',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
      {
        id: 'us_rc_73a8bJWRW2ovbJt74orF49TkJj7bQyyQ',
        values: {
          employeeId: {
            value: '21003',
            valid: true,
            messages: [],
          },
          managerId: {
            value: '21002',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Oliver',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'Reynolds',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-01',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'Date has been formatted as yyyy-MM-dd',
              },
            ],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Chief Information Officer',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Chief_Information_Officer',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Chief Information Officer',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'oreynolds@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(415) 435-1163',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
      {
        id: 'us_rc_e3hFkVlig4nun1cHmybt7feubhSKAFFr',
        values: {
          employeeId: {
            value: '21004',
            valid: true,
            messages: [],
          },
          managerId: {
            value: '21002',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Maximilian',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'Schneider',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-01',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'Date has been formatted as yyyy-MM-dd',
              },
            ],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Chief Operating Officer',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Chief_Operating_Officer',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Chief Operating Officer',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'mschneider@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(312) 766-0809',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
      {
        id: 'us_rc_FYBcQZQdJkt8gdNbCPbMNsritVkHhmiW',
        values: {
          employeeId: {
            value: '21005',
            valid: true,
            messages: [],
          },
          managerId: {
            value: '21004',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Teresa',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'Serrano',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-01',
            valid: true,
            messages: [],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Controller',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Controller',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Controller',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'tserrano@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(212) 755-8292',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
      {
        id: 'us_rc_tpXihgoi1bIY1p3U4lPS4kfdazqfziGh',
        values: {
          employeeId: {
            value: '21001',
            valid: false,
            messages: [
              {
                message: 'employeeId must be unique',
                source: 'unique-constraint',
                type: 'error',
              },
            ],
          },
          managerId: {
            value: '21001',
            valid: true,
            messages: [],
          },
          firstName: {
            value: 'Maria',
            valid: true,
            messages: [],
          },
          lastName: {
            value: 'Cardoza',
            valid: true,
            messages: [],
          },
          employeeType: {
            value: 'ft',
            valid: true,
            messages: [],
          },
          hireDate: {
            value: '2000-01-02',
            valid: true,
            messages: [],
          },
          endEmploymentDate: {
            value: null,
            valid: true,
            messages: [],
          },
          jobName: {
            value: 'Director, Employee Benefits',
            valid: true,
            messages: [],
          },
          jobCode: {
            value: 'Director_Employee_Benefits',
            valid: true,
            messages: [
              {
                type: 'info',
                source: 'custom-logic',
                message: 'jobCode set based on jobName.',
              },
            ],
          },
          positionTitle: {
            value: 'Director, Employee Benefits',
            valid: true,
            messages: [],
          },
          defaultWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          scheduledWeeklyHours: {
            value: 40,
            valid: true,
            messages: [],
          },
          emailAddress: {
            value: 'mcardoza@hcm.show',
            valid: true,
            messages: [],
          },
          phoneNumber: {
            value: '(415) 445-6767',
            valid: true,
            messages: [],
          },
        },
        metadata: {},
      },
    ];

    // Call the dedupeEmployees function with the inbound records
    const actual = dedupeEmployees(inbound);

    // Define the expected output
    const expected = ['us_rc_HrMVtwH6MxYWG7KsChqcZuIlzeJdAYGT'];

    // Compare the actual result with the expected result
    expect(actual).toStrictEqual(expected);
  });
});
