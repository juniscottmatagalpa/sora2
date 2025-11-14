import fetch from "node-fetch";


export default async function handler(req, res) {
if (req.method !== "POST")
return res.status(405).json({ code: 405, message: "Método no permitido" });


const { url } = req.body;
if (!url) return res.status(400).json({ code: 400, message: "URL faltante" });


try {
// Tu Worker de Cloudflare (es tu backend real)
const WORKER = process.env.CF_WORKER_URL;


const resp = await fetch(WORKER, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ url })
});


const data = await resp.json();
return res.status(200).json(data);


} catch (err) {
return res.status(500).json({ code: 500, message: "Error interno", err: err.message });
}
}

