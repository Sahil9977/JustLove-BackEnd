export function notFound(_req, res) { res.status(404).json({ error: 'Not found' }); }

// Express 5 forwards errors from async handlers here automatically.
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500, message = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') { status = 400; message = 'That image is too large (max 4 MB).'; }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(' '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid id.'; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON.'; }
  if (status >= 500) { console.error(err); message = 'Something went wrong on the server.'; }
  res.status(status).json({ error: message });
}
