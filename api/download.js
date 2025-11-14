import fetch from "node-fetch";


export default async function handler(req, res) {
if (req.method !== "POST")
return res.status(405).json({ code: 405, message: "Método no permitido" });


const { url } = req.body;
if (!url) return res.status(400).json({ code: 400, message: "Falta la URL" });


try {
const WORKER = "https://youtub-lake-6929.juniscottmatagalpa.workers.dev"; // YA CONFIGURADO


const r = await fetch(WORKER, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ url })
});


const data = await r.json();
return res.status(200).json(data);


} catch (e) {
return res.status(500).json({ code: 500, message: "Error interno", error: e.message });
}
}
