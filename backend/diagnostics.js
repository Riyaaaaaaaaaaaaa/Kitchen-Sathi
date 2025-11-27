#!/usr/bin/env node
/**
 * Backend Route Diagnostics Script
 * Run this to test your Express routes and identify 404 issues
 */

const API_BASE = 'http://localhost:5000';

async function testRoute(method, path, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    console.log(`\n🔍 Testing ${method} ${path}`);
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    try {
      const json = JSON.parse(data);
      console.log(`Response:`, json);
    } catch {
      console.log(`Response (text):`, data);
    }
    
    return { status: response.status, data: data };
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { status: 0, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Backend Route Diagnostics\n');
  
  // Test 1: Basic health check
  await testRoute('GET', '/api/health');
  
  // Test 2: API root
  await testRoute('GET', '/api');
  
  // Test 3: Register a test user
  console.log('\n📝 Registering test user...');
  const registerResult = await testRoute('POST', '/api/auth/register', {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  });
  
  let token = null;
  if (registerResult.status === 201) {
    try {
      const data = JSON.parse(registerResult.data);
      token = data.token;
      console.log('✅ Registration successful, token received');
    } catch (e) {
      console.log('❌ Failed to parse registration response');
    }
  }
  
  // Test 4: Login (if registration failed)
  if (!token) {
    console.log('\n🔑 Attempting login...');
    const loginResult = await testRoute('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResult.status === 200) {
      try {
        const data = JSON.parse(loginResult.data);
        token = data.token;
        console.log('✅ Login successful, token received');
      } catch (e) {
        console.log('❌ Failed to parse login response');
      }
    }
  }
  
  // Test 5: Test /api/me endpoint
  if (token) {
    await testRoute('GET', '/api/me', null, token);
  }
  
  // Test 6: Test groceries endpoints
  if (token) {
    console.log('\n🛒 Testing Grocery Endpoints...');
    
    // GET groceries
    await testRoute('GET', '/api/groceries', null, token);
    
    // POST groceries
    await testRoute('POST', '/api/groceries', {
      name: 'Test Item',
      quantity: 2,
      unit: 'pcs'
    }, token);
    
    // GET groceries again to see if item was added
    await testRoute('GET', '/api/groceries', null, token);
  } else {
    console.log('\n❌ No authentication token available, skipping protected routes');
  }
  
  // Test 7: Test without authentication (should fail)
  console.log('\n🔒 Testing without authentication (should fail)...');
  await testRoute('POST', '/api/groceries', {
    name: 'Unauthorized Item',
    quantity: 1,
    unit: 'kg'
  });
  
  console.log('\n✅ Diagnostics complete!');
  console.log('\n📋 Summary:');
  console.log('- If you see 404 errors, check that routes are properly mounted');
  console.log('- If you see 401 errors, authentication is working');
  console.log('- If you see 500 errors, check MongoDB connection and model imports');
  console.log('- If you see network errors, ensure backend is running on port 5000');
}

// Run diagnostics
runDiagnostics().catch(console.error);
