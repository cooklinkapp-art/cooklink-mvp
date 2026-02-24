import express from "express";
import cors from "cors";
import OpenAI from "openai";

// ⚠️ Clé API : définir OPENAI_API_KEY en variable d’environnement ou remplacer ci‑dessous
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  const recette = req.body?.recette;

  if (!recette || typeof recette !== "string") {
    return res.status(400).json({ error: "Corps attendu : { \"recette\": \"texte de la recette\" }" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en logistique culinaire pour l'application CookLink.
          TA MISSION : Extraire les ingrédients en JSON strict.
          RÈGLES IMPÉRATIVES :
          1. Quantités : Tu dois TOUJOURS estimer une quantité numérique. Convertis les mesures floues (verre, bol, pincée) en grammes ou ml standards.
          2. Unités : Utilise uniquement des unités métriques (g, ml, cl) ou "pièce".
          3. Rayon : Indique le rayon du magasin.
          
          FORMAT DE RÉPONSE ATTENDU (JSON pur) :
          {
            "recette": "Titre estimé",
            "ingredients": [
              { "item": "Nom", "quantite": 0, "unite": "g/ml", "rayon": "Rayon" }
            ]
          }`
        },
        { role: "user", content: recette },
      ],
      response_format: { type: "json_object" },
    });

    const resultat = completion.choices[0].message.content;
    const json = JSON.parse(resultat);
    res.json(json);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ error: error?.message ?? "Erreur lors de l'analyse." });
  }
});

// Sert les fichiers du dossier actuel (index.html, css, etc.)
app.use(express.static('.'));
app.listen(3000, () => {
  console.log("Serveur CookLink sur http://localhost:3000");
});
// test
// Ceci est un test pour forcer la mise a jour