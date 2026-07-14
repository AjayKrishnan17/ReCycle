require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dns = require('dns');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const orderRoutes = require('./routes/orders');
const configRoutes = require('./routes/config');

const app = express();

// --- Validate environment early for clearer deployment errors ---
function checkRequiredEnv() {
  const missing = [];
  if (!process.env.MONGO_URI) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.CLIENT_URL) missing.push('CLIENT_URL');

  if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please set them in your hosting provider (Render, Heroku, etc.) and redeploy.');
    process.exit(1);
  }
}

// Only enforce in production/redeploy environments
if (process.env.NODE_ENV === 'production') {
  checkRequiredEnv();
}

// Optional DNS override for environments where SRV lookups are blocked by ISP/router DNS.
if (process.env.DNS_SERVERS) {
  const dnsServers = process.env.DNS_SERVERS.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length) {
    dns.setServers(dnsServers);
    console.log(`Using custom DNS servers: ${dnsServers.join(', ')}`);
  }
}

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config', configRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ── Connect DB & start ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    if (err && err.code === 'ECONNREFUSED' && String(err.message).includes('querySrv')) {
      console.error('DB connection failed: MongoDB SRV DNS lookup was refused.');
      console.error('Try setting DNS_SERVERS=8.8.8.8,1.1.1.1 in Backend/.env and retry.');
    }

    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
