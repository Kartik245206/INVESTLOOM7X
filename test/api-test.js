require('isomorphic-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkResponse(response, endpoint) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${endpoint} failed: ${response.status} ${response.statusText}\n${text}`);
    }
    return response.json();
}

async function testAPI() {
    try {
        console.log('Starting API tests...');

        // Test health check
        console.log('\nTesting health check endpoint...');
        const pingResponse = await fetch(`${BASE_URL}/api/ping`);
        const pingData = await checkResponse(pingResponse, 'Health check');
        console.log('Health check response:', pingData);

        // Test products endpoint
        console.log('\nTesting products endpoint...');
        const productsResponse = await fetch(`${BASE_URL}/api/products`);
        const products = await checkResponse(productsResponse, 'Products');
        console.log('Products found:', products.count);
        console.log('Sample product:', products.products?.[0]);

        // Test debug endpoint
        console.log('\nTesting debug endpoint...');
        const debugResponse = await fetch(`${BASE_URL}/api/debug`);
        const debugInfo = await checkResponse(debugResponse, 'Debug');
        console.log('Debug info:', JSON.stringify(debugInfo, null, 2));

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

// Make sure server is running before testing
const checkServer = async () => {
    try {
        await fetch(`${BASE_URL}/api/ping`);
        return true;
    } catch (error) {
        return false;
    }
};

console.log('🚀 Starting API test suite...');
checkServer().then(isRunning => {
    if (!isRunning) {
        console.error('❌ Server is not running. Please start the server with `npm start` first.');
        process.exit(1);
    }
    return testAPI();
}).then(() => {
    console.log('\n✨ Test suite finished');
}).catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
});