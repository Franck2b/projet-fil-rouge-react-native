// Génère la planche de QR codes à coller sur les machines.
// Un code = un lien profond gabarit://machine/<slug>, lu par l'onglet « Arrivée ».
// Usage : npm run qr  (puis ouvrir qr-codes.html dans un navigateur et imprimer)

import { writeFile } from "node:fs/promises";
import QRCode from "qrcode";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Variables Supabase manquantes : lancez `node --env-file=.env scripts/generate-qr.mjs`.");
  process.exit(1);
}

const response = await fetch(`${url}/rest/v1/machines?select=slug,name&status=neq.retired&order=name`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (!response.ok) {
  console.error(`Supabase a répondu ${response.status}.`);
  process.exit(1);
}

const machines = await response.json();

const cards = await Promise.all(
  machines.map(async (machine) => {
    const target = `gabarit://machine/${machine.slug}`;
    const image = await QRCode.toDataURL(target, { margin: 1, width: 320 });

    return `<figure>
      <img src="${image}" alt="QR code ${machine.name}" />
      <figcaption><strong>${machine.name}</strong><br />${machine.slug}</figcaption>
    </figure>`;
  }),
);

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Gabarit · QR codes machines</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #f5f1e8; color: #15130f; padding: 24px; }
      h1 { text-transform: uppercase; letter-spacing: -0.02em; }
      div { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
      figure { margin: 0; border: 1px solid #ddd6c6; background: #fffdf8; padding: 12px; text-align: center; }
      img { width: 100%; height: auto; }
      figcaption { font-size: 13px; margin-top: 8px; }
    </style>
  </head>
  <body>
    <h1>QR codes des machines</h1>
    <p>Collez un code sur chaque machine. L'app les lit depuis l'onglet « Arrivée ».</p>
    <div>${cards.join("\n")}</div>
  </body>
</html>`;

await writeFile("qr-codes.html", html);
console.log(`qr-codes.html écrit (${machines.length} machines).`);
