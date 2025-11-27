#!/usr/bin/env node
/**
 * Complete API Test Script for Groceries Endpoint
 * Tests authentication and CRUD operations
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(method, path, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    console.log(`\n🔍 ${method} ${path}`);
    if (body) console.log(`📤 Body:`, body);
    if (token) console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    
    const response = await fetch(`${API_BASE}${path}`, options);
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    try {
      const json = JSON.parse(responseText);
      console.log(`📥 Response:`, json);
      return { status: response.status, data: json, success: response.ok };
    } catch {
      console.log(`📥 Response (text):`, responseText);
      return { status: response.status, data: responseText, success: response.ok };
    }
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { status: 0, error: error.message, success: false };
  }
}

async function runGroceriesTest() {
  console.log('🚀 Starting Groceries API Test\n');
  console.log('=' .repeat(60));
  
  // Step 1: Health Check
  console.log('\n1️⃣ Testing Health Endpoint');
  await makeRequest('GET', '/api/health');
  
  // Step 2: Register User
  console.log('\n2️⃣ Registering Test User');
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    email: 'groceries-test@example.com',
    name: 'Groceries Test User',
    password: 'password123'
  });
  
  let token = null;
  if (registerResult.success && registerResult.data.token) {
    token = registerResult.data.token;
    console.log('✅ Registration successful');
  } else {
    console.log('⚠️ Registration failed, trying login...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      email: 'groceries-test@example.com',
      password: 'password123'
    });
    
    if (loginResult.success && loginResult.data.token) {
      token = loginResult.data.token;
      console.log('✅ Login successful');
    } else {
      console.log('❌ Both registration and login failed');
      return;
    }
  }
  
  // Step 3: Test /api/me
  console.log('\n3️⃣ Testing User Profile');
  await makeRequest('GET', '/api/me', null, token);
  
  // Step 4: Test Groceries CRUD
  console.log('\n4️⃣ Testing Groceries CRUD Operations');
  
  // 4a: Get empty list
  console.log('\n4a. Getting empty grocery list');
  const getEmptyResult = await makeRequest('GET', '/api/groceries', null, token);
  
  // 4b: Add first item
  console.log('\n4b. Adding first grocery item');
  const addResult1 = await makeRequest('POST', '/api/groceries', {
    name: 'Apples',
    quantity: 5,
    unit: 'pcs'
  }, token);
  
  let itemId = null;
  if (addResult1.success && addResult1.data._id) {
    itemId = addResult1.data._id;
    console.log('✅ First item added successfully');
  }
  
  // 4c: Add second item
  console.log('\n4c. Adding second grocery item');
  const addResult2 = await makeRequest('POST', '/api/groceries', {
    name: 'Milk',
    quantity: 2,
    unit: 'l'
  }, token);
  
  // 4d: Get list (should have 2 items)
  console.log('\n4d. Getting grocery list');
  const getListResult = await makeRequest('GET', '/api/groceries', null, token);
  
  // 4e: Update first item
  if (itemId) {
    console.log('\n4e. Updating first item');
    await makeRequest('PATCH', `/api/groceries/${itemId}`, {
      completed: true,
      quantity: 3
    }, token);
  }
  
  // 4f: Get updated list
  console.log('\n4f. Getting updated grocery list');
  await makeRequest('GET', '/api/groceries', null, token);
  
  // 4g: Delete first item
  if (itemId) {
    console.log('\n4g. Deleting first item');
    await makeRequest('DELETE', `/api/groceries/${itemId}`, null, token);
  }
  
  // 4h: Get final list
  console.log('\n4h. Getting final grocery list');
  await makeRequest('GET', '/api/groceries', null, token);
  
  // Step 5: Test Error Cases
  console.log('\n5️⃣ Testing Error Cases');
  
  // 5a: Unauthorized access
  console.log('\n5a. Testing unauthorized access (should fail)');
  await makeRequest('POST', '/api/groceries', {
    name: 'Unauthorized Item',
    quantity: 1,
    unit: 'kg'
  }); // No token
  
  // 5b: Invalid data
  console.log('\n5b. Testing invalid data (should fail)');
  await makeRequest('POST', '/api/groceries', {
    name: '', // Invalid: empty name
    quantity: 0, // Invalid: quantity too low
    unit: 'kg'
  }, token);
  
  // 5c: Non-existent item update
  console.log('\n5c. Testing update of non-existent item (should fail)');
  await makeRequest('PATCH', '/api/groceries/507f1f77bcf86cd799439011', {
    completed: true
  }, token);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Groceries API Test Complete!');
  console.log('\n📋 What to check in backend console:');
  console.log('- [routes] 🛒 Groceries route hit: POST /');
  console.log('- [groceries] ➕ POST request - User: <user-id>');
  console.log('- [groceries] 📤 Request body: {name, quantity, unit}');
  console.log('- [groceries] ✅ Validation passed, creating item...');
  console.log('- [groceries] ✅ Item created successfully: <item-id>');
}

// Run the test
runGroceriesTest().catch(console.error);
