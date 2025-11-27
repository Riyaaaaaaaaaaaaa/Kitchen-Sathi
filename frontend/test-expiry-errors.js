// Test script to verify ExpirySettings error handling
// Run this in browser console to test the exact error format you're receiving

import { processApiError, processApiErrorDebug } from '../utils/errorHandling';

// Test the exact error format you're receiving
const testError = {
  details: {
    formErrors: [],
    fieldErrors: {
      expiryDate: ["Invalid datetime"]
    }
  }
};

console.log('🧪 Testing ExpirySettings Error Handling\n');

console.log('1. Testing exact error format from your backend:');
console.log('Input error:', testError);

const processed = processApiErrorDebug(testError);
console.log('Processed result:', processed);
console.log('Field errors:', processed.fieldErrors);
console.log('General message:', processed.message);
console.log('Is validation error:', processed.isValidationError);

console.log('\n2. Testing field-specific error extraction:');
console.log('expiryDate errors:', processed.fieldErrors.expiryDate);
console.log('daysBeforeExpiry errors:', processed.fieldErrors.daysBeforeExpiry);

console.log('\n3. Expected behavior:');
console.log('- Field errors should be extracted:', Object.keys(processed.fieldErrors));
console.log('- General message should mention field names:', processed.message);
console.log('- Should be marked as validation error:', processed.isValidationError);

// Test different scenarios
const testScenarios = [
  {
    name: "Only expiryDate error",
    error: {
      details: {
        formErrors: [],
        fieldErrors: {
          expiryDate: ["Invalid datetime"]
        }
      }
    }
  },
  {
    name: "Only daysBeforeExpiry error", 
    error: {
      details: {
        formErrors: [],
        fieldErrors: {
          daysBeforeExpiry: ["Must be numbers between 0 and 30"]
        }
      }
    }
  },
  {
    name: "Multiple field errors",
    error: {
      details: {
        formErrors: [],
        fieldErrors: {
          expiryDate: ["Invalid datetime"],
          daysBeforeExpiry: ["Must be numbers between 0 and 30"]
        }
      }
    }
  },
  {
    name: "Form-level error only",
    error: {
      details: {
        formErrors: ["Please check the form"],
        fieldErrors: {}
      }
    }
  },
  {
    name: "Mixed form and field errors",
    error: {
      details: {
        formErrors: ["Please check the form"],
        fieldErrors: {
          expiryDate: ["Invalid datetime"]
        }
      }
    }
  }
];

console.log('\n4. Testing all scenarios:');
testScenarios.forEach((scenario, index) => {
  console.log(`\nScenario ${index + 1}: ${scenario.name}`);
  const result = processApiErrorDebug(scenario.error);
  console.log('Result:', result);
  console.log('Field errors:', result.fieldErrors);
  console.log('Message:', result.message);
});

console.log('\n✅ Test complete! Check the results above.');
console.log('If field errors are not being extracted, there may be an issue with the error processing logic.');
