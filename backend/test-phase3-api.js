#!/usr/bin/env node

// Comprehensive API Testing Script for Phase 3
// Tests all expiry and notification endpoints

const BASE_URL = 'http://localhost:5000';

async function testEndpoint(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    console.log(`\n🔍 Testing: ${method} ${path}`);
    const response = await fetch(url, options);
    const text = await response.text();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    // Try to parse as JSON
    let jsonData = null;
    try {
      jsonData = JSON.parse(text);
      console.log(`✅ JSON Response:`, JSON.stringify(jsonData, null, 2));
    } catch (parseError) {
      console.log(`❌ Not JSON - Raw response:`, text.substring(0, 200));
      console.log(`❌ Parse error:`, parseError.message);
    }
    
    return { success: response.ok, status: response.status, data: jsonData, text };
  } catch (error) {
    console.log(`💥 Network error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Phase 3 API Diagnostics...\n');
  
  // Test 1: Basic health check
  console.log('='.repeat(50));
  console.log('1. BASIC HEALTH CHECK');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/health');
  await testEndpoint('GET', '/api');
  
  // Test 2: Authentication flow
  console.log('\n' + '='.repeat(50));
  console.log('2. AUTHENTICATION FLOW');
  console.log('='.repeat(50));
  
  const registerResult = await testEndpoint('POST', '/api/auth/register', {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  });
  
  let token = null;
  if (registerResult.success && registerResult.data) {
    token = registerResult.data.token;
    console.log(`🔑 Got token: ${token?.substring(0, 20)}...`);
  }
  
  // Test 3: Protected routes without auth
  console.log('\n' + '='.repeat(50));
  console.log('3. PROTECTED ROUTES (NO AUTH)');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/groceries/expiring');
  await testEndpoint('GET', '/api/groceries/expired');
  await testEndpoint('GET', '/api/groceries/notifications');
  
  // Test 4: Protected routes with auth
  if (token) {
    console.log('\n' + '='.repeat(50));
    console.log('4. PROTECTED ROUTES (WITH AUTH)');
    console.log('='.repeat(50));
    await testEndpoint('GET', '/api/groceries/expiring', null, token);
    await testEndpoint('GET', '/api/groceries/expired', null, token);
    await testEndpoint('GET', '/api/groceries/notifications', null, token);
    await testEndpoint('GET', '/api/groceries/expiry/stats', null, token);
    
    // Test 5: Create grocery item with expiry
    console.log('\n' + '='.repeat(50));
    console.log('5. CREATE ITEM WITH EXPIRY');
    console.log('='.repeat(50));
    const createResult = await testEndpoint('POST', '/api/groceries', {
      name: 'Test Milk',
      quantity: 1,
      unit: 'bottle',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      notificationPreferences: {
        enabled: true,
        daysBeforeExpiry: [1, 3, 7],
        emailNotifications: true,
        inAppNotifications: true
      }
    }, token);
    
    if (createResult.success && createResult.data) {
      const itemId = createResult.data._id || createResult.data.id;
      console.log(`📦 Created item with ID: ${itemId}`);
      
      // Test 6: Update expiry settings
      console.log('\n' + '='.repeat(50));
      console.log('6. UPDATE EXPIRY SETTINGS');
      console.log('='.repeat(50));
      await testEndpoint('PATCH', `/api/groceries/${itemId}/expiry`, {
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        notificationPreferences: {
          enabled: true,
          daysBeforeExpiry: [1, 2, 5],
          emailNotifications: false,
          inAppNotifications: true
        }
      }, token);
    }
  }
  
  // Test 7: Admin routes
  console.log('\n' + '='.repeat(50));
  console.log('7. ADMIN ROUTES');
  console.log('='.repeat(50));
  await testEndpoint('POST', '/api/groceries/expiry/check', null, token);
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 DIAGNOSTICS COMPLETE');
  console.log('='.repeat(50));
  console.log('\n📋 Summary:');
  console.log('- Check if backend is running on port 5000');
  console.log('- Verify all routes return JSON (not HTML)');
  console.log('- Check authentication is working');
  console.log('- Verify database connection');
  console.log('\n🔧 If you see HTML responses, check:');
  console.log('1. Backend server is running');
  console.log('2. Routes are properly registered');
  console.log('3. No syntax errors in route files');
  console.log('4. Database connection is working');
}

// Run the tests
runTests().catch(console.error);
