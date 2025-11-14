// api/download.js
import fetch from "node-fetch";


export default async function handler(req, res) {
if (req.method !== "POST")
return res.status(405).json({ code: 405, message: "Método no permitido" });


const { url } = req.body;
if (!url) return res.status(400).json({ code: 400, message: "Falta el parámetro url" });


try {
// 🔥 API alternativa tipo SoraHub o FakeSora
const API = `https://soraapi-proxy.example.com/api/lookup?url=${encodeURIComponent(url)}`;


const r = await fetch(API);
const j = await r.json();


if (!j.success)
return res.status(400).json({ code: 400, message: "No se pudo recuperar el video" });


return res.status(200).json({
code: 200,
data: {
thumbnail: j.data.thumbnail,
prompt: j.data.prompt,
video_url: j.data.video_url,
no_watermark_url: j.data.no_watermark_url,
width: j.data.width,
height: j.data.height
}
});


} catch (err) {
console.error(err);
return res.status(500).json({ code: 500, message: "Error interno del servidor" });
}
}
