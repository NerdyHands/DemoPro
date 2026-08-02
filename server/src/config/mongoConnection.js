const dns = require('dns');

/**
 * Optional public DNS for local dev when a filter (AdGuard, NextDNS, etc.)
 * points Node at 127.0.0.1 and breaks mongodb+srv SRV lookups.
 */
function configureMongoDns() {
  const servers = process.env.MONGODB_DNS_SERVERS;
  if (!servers) return;

  const list = servers.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return;

  dns.setServers(list);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔧 MongoDB DNS servers: ${list.join(', ')}`);
  }
}

function getMongoConnectOptions() {
  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
  };

  if (process.env.MONGODB_TLS_ALLOW_INVALID === 'true') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  MONGODB_TLS_ALLOW_INVALID is ignored in production');
    } else {
      options.tlsAllowInvalidCertificates = true;
      console.log('🔧 MongoDB TLS: certificate validation relaxed (development only)');
    }
  }

  return options;
}

module.exports = { configureMongoDns, getMongoConnectOptions };
