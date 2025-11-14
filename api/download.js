// api/download.js
export default async function handler(req, res) {
  const API_KEY = process.env.PROXY_API_KEY || "";
  const provided = req.headers['x-api-key'] || "";

  if (provided !== API_KEY) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  // Recibe URL por query o body
  const target = req.method === 'GET' ? req.query.url : (req.body && req.body.url);
  if (!target) {
    res.statusCode = 400;
    res.end('Missing url param');
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        // opcional: podrías pasar cookies/autorizaciones si TU sesión las requiere,
        // pero no incluyas credenciales de terceros sin permiso.
        'User-Agent': 'Sora-proxy/1.0'
      }
    });

    if (!upstream.ok) {
      res.statusCode = 502;
      res.end('Upstream fetch failed: ' + upstream.status);
      return;
    }

    // Determinar nombre de archivo sencillo
    const contentDispositionFromUp = upstream.headers.get('content-disposition');
    let filename = 'video';
    if (contentDispositionFromUp) {
      const m = /filename="?([^"]+)"?/.exec(contentDispositionFromUp);
      if (m) filename = m[1];
    } else {
      const urlName = new URL(target).pathname.split('/').pop();
      if (urlName) filename = urlName;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Optional security headers
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Streamear cuerpo al cliente
    const reader = upstream.body.getReader();
    const stream = new ReadableStream({
      pull(controller) {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        });
      }
    });
    const responseBody = stream.pipeThrough(new TextEncoderStream()); // Vercel env compatibility may variar
    // En Node/Vercel, podemos usar pipeTo:
    const nodeStream = upstream.body; // en runtimes con fetch.body como stream
    // Si pipe directo no funciona, fallback a buffer (solo si archivo no muy grande)
    // Aquí haremos simple: usar arrayBuffer -> send (menos eficiente para archivos grandes)
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal error');
  }
}
