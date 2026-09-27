function tryOpsService(req) {
  const expected = String(process.env.OPS_SERVICE_TOKEN || '').trim();
  if (!expected) return false;
  const header = String(req.header('X-Ops-Service-Token') || '').trim();
  const bearer = String(req.header('Authorization') || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  if (header !== expected && bearer !== expected) return false;
  req.opsService = true;
  req.user = { _id: 'ops-service', role: 'admin', isActive: true };
  return true;
}

module.exports = { tryOpsService };
