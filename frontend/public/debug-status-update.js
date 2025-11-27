// KitchenSathi Status Update Debug Helper
// Paste this into your browser console (F12) to debug status update issues

console.log('%c🔧 KitchenSathi Debug Helper Loaded', 'background: #f97316; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

// Override fetch to log all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  // Only log grocery-related API calls
  if (url.includes('/api/groceries')) {
    console.group(`%c🌐 API Request: ${options?.method || 'GET'} ${url}`, 'color: #3b82f6; font-weight: bold;');
    console.log('URL:', url);
    console.log('Method:', options?.method || 'GET');
    
    if (options?.headers) {
      console.log('Headers:', options.headers);
    }
    
    if (options?.body) {
      try {
        console.log('Body:', JSON.parse(options.body));
      } catch (e) {
        console.log('Body:', options.body);
      }
    }
    
    // Call original fetch and log response
    return originalFetch.apply(this, args)
      .then(response => {
        const clonedResponse = response.clone();
        
        clonedResponse.json()
          .then(data => {
            if (response.ok) {
              console.log('%c✅ Response Success:', 'color: #10b981; font-weight: bold;', data);
            } else {
              console.error('%c❌ Response Error:', 'color: #ef4444; font-weight: bold;', data);
            }
            console.log('Status:', response.status, response.statusText);
            console.groupEnd();
          })
          .catch(() => {
            console.log('Status:', response.status, response.statusText);
            console.log('(No JSON body)');
            console.groupEnd();
          });
        
        return response;
      })
      .catch(error => {
        console.error('%c❌ Network Error:', 'color: #ef4444; font-weight: bold;', error);
        console.groupEnd();
        throw error;
      });
  }
  
  return originalFetch.apply(this, args);
};

// Helper function to test status update
window.testStatusUpdate = function(itemId, newStatus) {
  console.log(`%c🧪 Testing Status Update: ${itemId} → ${newStatus}`, 'background: #8b5cf6; color: white; padding: 5px;');
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('❌ No auth token found. Please login first.');
    return;
  }
  
  let endpoint, method;
  
  switch(newStatus) {
    case 'completed':
      endpoint = `/api/groceries/${itemId}/mark-completed`;
      method = 'POST';
      break;
    case 'used':
      endpoint = `/api/groceries/${itemId}/mark-used`;
      method = 'POST';
      break;
    default:
      endpoint = `/api/groceries/${itemId}/status`;
      method = 'PATCH';
  }
  
  return fetch(`http://localhost:5000${endpoint}`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: method === 'PATCH' ? JSON.stringify({ status: newStatus }) : undefined
  })
    .then(res => res.json())
    .then(data => {
      console.log('%c✅ Test Success!', 'background: #10b981; color: white; padding: 5px;', data);
      return data;
    })
    .catch(err => {
      console.error('%c❌ Test Failed!', 'background: #ef4444; color: white; padding: 5px;', err);
      throw err;
    });
};

// Helper to list all grocery items
window.listGroceries = function() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('❌ No auth token found. Please login first.');
    return;
  }
  
  return fetch('http://localhost:5000/api/groceries', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(items => {
      console.table(items.map(item => ({
        id: item._id.substring(0, 8) + '...',
        name: item.name,
        status: item.status,
        quantity: `${item.quantity} ${item.unit}`,
        expiry: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'None'
      })));
      console.log('Full data:', items);
      return items;
    });
};

// Helper to check backend health
window.checkBackend = function() {
  console.log('%c🏥 Checking Backend Health...', 'background: #3b82f6; color: white; padding: 5px;');
  
  return fetch('http://localhost:5000/api')
    .then(res => res.json())
    .then(data => {
      console.log('%c✅ Backend is running!', 'background: #10b981; color: white; padding: 5px;', data);
      return data;
    })
    .catch(err => {
      console.error('%c❌ Backend is NOT running!', 'background: #ef4444; color: white; padding: 5px;', err);
      console.log('Make sure to start the backend server:');
      console.log('  cd D:\\AajKyaBanega\\backend');
      console.log('  npm run dev');
      throw err;
    });
};

// Display available commands
console.log('%cAvailable Debug Commands:', 'font-size: 14px; font-weight: bold; color: #f97316;');
console.log('%c1. checkBackend()', 'color: #3b82f6;', '- Verify backend is running');
console.log('%c2. listGroceries()', 'color: #3b82f6;', '- Show all grocery items in table');
console.log('%c3. testStatusUpdate(itemId, status)', 'color: #3b82f6;', '- Test status change');
console.log('   Examples:');
console.log('     testStatusUpdate("6543f2abc...", "completed")');
console.log('     testStatusUpdate("6543f2abc...", "used")');
console.log('     testStatusUpdate("6543f2abc...", "pending")');
console.log('');
console.log('%c💡 Tip: All API calls are now being logged automatically!', 'background: #fbbf24; color: #000; padding: 5px;');
console.log('');

// Auto-check backend on load
checkBackend().then(() => {
  console.log('%c🚀 Ready to debug! Try clicking a status badge.', 'background: #10b981; color: white; padding: 5px;');
});

