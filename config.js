const config = {
    API_BASE: process.env.NODE_ENV === 'production' 
        ? 'https://liberty-market.onrender.com'  // Update this with your actual Render URL
        : 'http://localhost:3000'
};