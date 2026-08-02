function sanitizeFilename(name) {
  if (!name) return 'document';
  return String(name)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .trim() || 'document';
}

function sendDocxBuffer(res, buffer, filenameBase) {
  const safe = sanitizeFilename(filenameBase);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename=\"${safe}.docx\"`);
  res.send(buffer);
}

module.exports = {
  sendDocxBuffer,
  sanitizeFilename
};

