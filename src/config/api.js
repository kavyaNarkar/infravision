// Environment-aware API Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Production URL (Render.com)
const PROD_URL = 'https://infravison-ai.onrender.com';

// In local dev, we use Vite Proxy (''). In production, we use the Render URL.
export const API_BASE_URL = isLocal ? '' : PROD_URL;

// These are secondary microservices. You can also make these conditional if needed.
export const POTHOLE_API_URL = isLocal ? '/api/potholes' : 'https://infrastructure-monitoring-system.onrender.com';
export const FLASK_API_URL = isLocal ? '/api/bridges' : 'https://infrastructure-monitoring-system-1.onrender.com';
export const WATER_API_URL = isLocal ? '/api/waterleakage' : 'https://infrastructure-monitoring-system-2.onrender.com';

export default API_BASE_URL;
