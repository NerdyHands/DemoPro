const dns = require('dns');
const tls = require('tls');

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Node 17+ defaults to DNS order "verbatim", which can stall on broken IPv6.
 * Atlas here is IPv4-only; prefer A records first.
 */
function preferIpv4() {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {
    // older Node without this API
  }
}

/**
 * Optional public DNS for local dev when a filter (AdGuard, NextDNS, etc.)
 * points Node at 127.0.0.1 and breaks mongodb+srv SRV lookups.
 * If MONGODB_DNS_SERVERS is unset, still fall back when DNS is loopback.
 */
function configureMongoDns() {
  preferIpv4();

  const fromEnv = process.env.MONGODB_DNS_SERVERS;
  const current = dns.getServers();
  const loopback = current.some((s) => s === '::1' || s.startsWith('127.'));

  let list = [];
  if (fromEnv) {
    list = fromEnv.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (loopback && !isProduction()) {
    list = ['8.8.8.8', '1.1.1.1'];
  }

  if (list.length === 0) return;

  dns.setServers(list);
  if (!isProduction()) {
    console.log(`🔧 MongoDB DNS servers: ${list.join(', ')}`);
  }
}

/**
 * Norton (and similar) HTTPS scanners install a local root CA in Windows
 * but Node's bundled Mozilla CAs do not include it. Merge the OS store so
 * intercepted Atlas TLS can still verify.
 */
function trustOsCertificateStore() {
  if (isProduction()) return;
  if (typeof tls.getCACertificates !== 'function' || typeof tls.setDefaultCACertificates !== 'function') {
    return;
  }

  try {
    const combined = [
      ...tls.getCACertificates('default'),
      ...tls.getCACertificates('system'),
    ];
    tls.setDefaultCACertificates(combined);
    console.log(`🔧 TLS: using Node CAs plus OS trust store (${combined.length} certs)`);
  } catch (error) {
    console.warn('⚠️  Could not load OS TLS certificates:', error.message);
  }
}

function shouldRelaxTls() {
  if (isProduction()) {
    if (process.env.MONGODB_TLS_ALLOW_INVALID === 'true') {
      console.warn('⚠️  MONGODB_TLS_ALLOW_INVALID is ignored in production');
    }
    return false;
  }

  // Default on in development: SSL inspection (Norton, etc.) breaks Atlas verify.
  // Set MONGODB_TLS_ALLOW_INVALID=false to force strict verification.
  return process.env.MONGODB_TLS_ALLOW_INVALID !== 'false';
}

function getMongoConnectOptions() {
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
    family: 4,
  };

  if (shouldRelaxTls()) {
    options.tls = true;
    options.tlsAllowInvalidCertificates = true;
    options.tlsAllowInvalidHostnames = true;
    console.log('🔧 MongoDB TLS: certificate validation relaxed (development only)');
  }

  return options;
}

function logMongoConnectError(error, attempt, maxAttempts) {
  const suffix = attempt && maxAttempts ? ` (attempt ${attempt}/${maxAttempts})` : '';
  console.error(`❌ MongoDB connection error${suffix}:`, error.message);

  const servers = error.reason && error.reason.servers;
  if (servers) {
    for (const [host, desc] of servers) {
      const detail = (desc.error && desc.error.message) || desc.reason || desc.type;
      console.error(`   ${host}: ${detail}`);
    }
  }

  if (!isProduction()) {
    console.error('🔍 Local TLS/DNS: Norton HTTPS scan and 127.0.0.1 DNS filters commonly cause this.');
    console.error('   Exclude node.exe / port 27017 from SSL scanning, or keep the dev TLS bypass enabled.');
  }
}

module.exports = {
  configureMongoDns,
  trustOsCertificateStore,
  getMongoConnectOptions,
  logMongoConnectError,
};
