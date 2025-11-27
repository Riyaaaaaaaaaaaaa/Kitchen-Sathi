#!/usr/bin/env node
/**
 * Complete API Test Script for KitchenSathi Backend
 * Tests all endpoints including groceries CRUD operations
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

async function runCompleteTest() {
  console.log('🚀 Starting Complete API Test Suite\n');
  console.log('=' .repeat(50));
  
  // Test 1: Health Check
  console.log('\n1️⃣ Testing Health Endpoint');
  await makeRequest('GET', '/api/health');
  
  // Test 2: API Root
  console.log('\n2️⃣ Testing API Root');
  await makeRequest('GET', '/api');
  
  // Test 3: Register User
  console.log('\n3️⃣ Testing User Registration');
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  });
  
  let token = null;
  if (registerResult.success && registerResult.data.token) {
    token = registerResult.data.token;
    console.log('✅ Registration successful');
  } else {
    console.log('⚠️ Registration failed, trying login...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
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
  
  // Test 4: Get User Profile
  console.log('\n4️⃣ Testing User Profile');
  await makeRequest('GET', '/api/me', null, token);
  
  // Test 5: Groceries CRUD Operations
  console.log('\n5️⃣ Testing Groceries CRUD');
  
  // 5a: Get empty grocery list
  console.log('\n5a. Getting empty grocery list');
  const getEmptyResult = await makeRequest('GET', '/api/groceries', null, token);
  
  // 5b: Add first item
  console.log('\n5b. Adding first grocery item');
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
  
  // 5c: Add second item
  console.log('\n5c. Adding second grocery item');
  const addResult2 = await makeRequest('POST', '/api/groceries', {
    name: 'Milk',
    quantity: 2,
    unit: 'l'
  }, token);
  
  // 5d: Get grocery list (should have 2 items)
  console.log('\n5d. Getting grocery list');
  const getListResult = await makeRequest('GET', '/api/groceries', null, token);
  
  // 5e: Update first item
  if (itemId) {
    console.log('\n5e. Updating first item');
    await makeRequest('PATCH', `/api/groceries/${itemId}`, {
      completed: true,
      quantity: 3
    }, token);
  }
  
  // 5f: Get updated list
  console.log('\n5f. Getting updated grocery list');
  await makeRequest('GET', '/api/groceries', null, token);
  
  // 5g: Delete first item
  if (itemId) {
    console.log('\n5g. Deleting first item');
    await makeRequest('DELETE', `/api/groceries/${itemId}`, null, token);
  }
  
  // 5h: Get final list
  console.log('\n5h. Getting final grocery list');
  await makeRequest('GET', '/api/groceries', null, token);
  
  // Test 6: Unauthorized Access
  console.log('\n6️⃣ Testing Unauthorized Access');
  await makeRequest('POST', '/api/groceries', {
    name: 'Unauthorized Item',
    quantity: 1,
    unit: 'kg'
  }); // No token
  
  // Test 7: Invalid Data
  console.log('\n7️⃣ Testing Invalid Data');
  await makeRequest('POST', '/api/groceries', {
    name: '', // Invalid: empty name
    quantity: 0, // Invalid: quantity too low
    unit: 'kg'
  }, token);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Complete API Test Suite Finished');
  console.log('\n📋 What to check:');
  console.log('- Backend console should show route hits');
  console.log('- All grocery operations should work');
  console.log('- Unauthorized requests should return 401');
  console.log('- Invalid data should return 400');
  console.log('- MongoDB should contain the test data');
}

// Run the complete test
runCompleteTest().catch(console.error);
