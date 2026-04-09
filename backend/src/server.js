const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');

// Connect Database
connectDB();

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined.');
  process.exit(1);
}

app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api', require('./routes/streetlightRoutes'));
app.use('/api', require('./routes/dataRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
