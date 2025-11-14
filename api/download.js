// api/download.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 405, message: 'Method not allowed' });

  const { video_url } = req.body || {};
  if (!video_url) return res.status(400).json({ code: 400, message: 'video_url missing' });

  const SORA_API_URL = process.env.SORA_API_URL;
  const SORA_API_KEY = process.env.SORA_API_KEY;

  try {
    if (!SORA_API_URL || !SORA_API_KEY) {
      // Mock response para pruebas locales
      return res.status(200).json({
        code: 200,
        data: {
          encoded_video_url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          nowatermarked_video_url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          image_url: 'https://picsum.photos/320/180',
          video_width: 1280,
          video_height: 720,
          description: 'Mock video (no SORA keys configured)'
        }
      });
    }

    // Si tienes API real, llama al endpoint de Sora (ajusta según la API real)
    const response = await fetch(SORA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SORA_API_KEY}`
      },
      body: JSON.stringify({ video_url })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Sora API error', response.status, text);
      return res.status(502).json({ code: 502, message: 'Sora API error', detail: text });
    }

    const payload = await response.json();

    // MAPEAR según la estructura real de la respuesta de Sora.
    // Aquí asumo que la respuesta contiene direct links en payload.result.video_url u otro campo.
    // Ajústalo a tu API real.
    const encodedVideoUrl = payload.encoded_video_url || payload.video_url || payload.result?.video_url;
    const nowatermarked = payload.nowatermarked_video_url || null;
    const image = payload.image_url || payload.thumbnail || null;

    if (!encodedVideoUrl) {
      // Si la respuesta no tiene el link esperado, devuelves payload para depuración
      return res.status(200).json({ code: 200, data: { raw: payload } });
    }

    return res.status(200).json({
      code: 200,
      data: {
        encoded_video_url: encodedVideoUrl,
        nowatermarked_video_url: nowatermarked,
        image_url: image,
        description: payload.description || null
      }
    });

  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}
