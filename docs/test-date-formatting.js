// Test script for date formatting
// Run with: node test-date-formatting.js

// Test date formatting function
function formatDateForAPI(dateString) {
  if (!dateString) return undefined;
  
  try {
    // Convert YYYY-MM-DD to full ISO string
    const isoString = new Date(dateString + 'T00:00:00.000Z').toISOString();
    console.log('Date formatted:', dateString, '→', isoString);
    return isoString;
  } catch (error) {
    console.error('Date formatting error:', error);
    throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
  }
}

// Test cases
console.log('🧪 Testing Date Formatting\n');

const testCases = [
  '2025-11-25',
  '2025-12-31',
  '2025-01-01',
  '',
  undefined
];

testCases.forEach((testDate, index) => {
  console.log(`Test ${index + 1}:`);
  console.log('  Input:', testDate);
  
  try {
    const result = formatDateForAPI(testDate);
    console.log('  Output:', result);
    console.log('  Status: ✅ Success\n');
  } catch (error) {
    console.log('  Error:', error.message);
    console.log('  Status: ❌ Failed\n');
  }
});

// Test backend validation simulation
console.log('🔧 Testing Backend Validation\n');

function simulateBackendValidation(dateString) {
  if (!dateString) return undefined;
  
  // Accept multiple date formats
  let date = new Date(dateString);
  
  // If invalid, try adding time component for YYYY-MM-DD format
  if (isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    date = new Date(dateString + 'T00:00:00.000Z');
  }
  
  // If still invalid, try parsing as local date
  if (isNaN(date.getTime())) {
    date = new Date(dateString + 'T00:00:00');
  }
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD or ISO string.');
  }
  
  return date.toISOString();
}

const backendTestCases = [
  '2025-11-25',
  '2025-11-25T00:00:00.000Z',
  '2025-11-25T12:30:45.123Z',
  'invalid-date',
  ''
];

backendTestCases.forEach((testDate, index) => {
  console.log(`Backend Test ${index + 1}:`);
  console.log('  Input:', testDate);
  
  try {
    const result = simulateBackendValidation(testDate);
    console.log('  Output:', result);
    console.log('  Status: ✅ Success\n');
  } catch (error) {
    console.log('  Error:', error.message);
    console.log('  Status: ❌ Failed\n');
  }
});

console.log('🎉 Date formatting tests complete!');
