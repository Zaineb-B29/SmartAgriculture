from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import json
import re

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"


# ─────────────────────────────────────────────
# Helper: call Ollama (Mistral or LLaVA)
# ─────────────────────────────────────────────
def call_ollama(model, prompt, image_b64=None):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    if image_b64:
        payload["images"] = [image_b64]

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Ollama error ({model}): {e}")
        return None


# ─────────────────────────────────────────────
# Helper: safely parse JSON from model output
# ─────────────────────────────────────────────
def parse_json_response(text):
    if not text:
        return {}
    text = re.sub(r"```json|```", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "maladie": "Analyse non structurée",
            "niveau_risque": "moyen",
            "recommandations": text
        }


# ─────────────────────────────────────────────
# POST /analyse  – called by Spring Boot
# ─────────────────────────────────────────────
@app.route("/analyse", methods=["POST"])
def analyser_besoin():
    try:
        titre        = request.form.get("titre", "")
        description  = request.form.get("description", "")
        lieu         = request.form.get("lieu", "")
        image_file   = request.files.get("image")

        if not image_file:
            return jsonify({"error": "Image manquante"}), 400

        # Encode image to base64 for LLaVA
        image_b64 = base64.b64encode(image_file.read()).decode("utf-8")

        # ── Step 1: LLaVA visual analysis ──────────────
        llava_prompt = (
            "You are a plant disease expert. Look at this plant image carefully.\n"
            "Describe exactly what you see: leaf color, spots, lesions, wilting, or any abnormality.\n"
            "Then identify the most likely plant disease.\n"
            "You MUST respond with ONLY this JSON, no other text:\n"
            '{"maladie": "name of disease in French", '
            '"niveau_risque": "faible or moyen or élevé", '
            '"description_visuelle": "what you see on the leaves and plant in French"}'
        )
        llava_raw   = call_ollama("llava", llava_prompt, image_b64)
        print(f"LLaVA raw response: {llava_raw}")
        llava_data  = parse_json_response(llava_raw)

        maladie_image        = llava_data.get("maladie", "")
        risque_image         = llava_data.get("niveau_risque", "moyen")
        description_visuelle = llava_data.get("description_visuelle", llava_raw or "")

        # ── Step 2: Mistral text analysis + recommendations ──
        mistral_prompt = (
            "Tu es un expert agronome tunisien spécialisé dans les maladies des plantes.\n\n"
            "Un agriculteur a soumis le besoin suivant :\n"
            f"- Titre : {titre}\n"
            f"- Description : {description}\n"
            f"- Lieu : {lieu}\n\n"
            f"Une analyse visuelle de l'image a révélé :\n"
            f"- Maladie suspectée : {maladie_image if maladie_image else 'à déterminer selon la description'}\n"
            f"- Observation visuelle : {description_visuelle}\n"
            f"- Niveau de risque estimé : {risque_image}\n\n"
            "En tant qu'expert, génère :\n"
            "1. Le nom précis de la maladie détectée\n"
            "2. Le niveau de risque (faible, moyen ou élevé)\n"
            "3. Des recommandations détaillées de traitement incluant :\n"
            "   - Le traitement chimique ou biologique recommandé\n"
            "   - Les mesures préventives\n"
            "   - Les actions urgentes si le risque est élevé\n\n"
            "Réponds UNIQUEMENT avec ce JSON valide, aucun autre texte :\n"
            '{"maladie": "nom précis de la maladie en français", '
            '"niveau_risque": "faible ou moyen ou élevé", '
            '"recommandations": "recommandations détaillées et pratiques en français"}'
        )
        mistral_raw  = call_ollama("mistral", mistral_prompt)
        print(f"Mistral raw response: {mistral_raw}")
        mistral_data = parse_json_response(mistral_raw)

        final_maladie        = mistral_data.get("maladie") or maladie_image or "Maladie fongique"
        final_risque         = mistral_data.get("niveau_risque") or risque_image or "moyen"
        final_recommandations = mistral_data.get("recommandations") or (
            "Contacter un expert agricole local pour une inspection physique. "
            "Isoler les plants malades pour éviter la propagation."
        )

        return jsonify({
            "maladie":         final_maladie,
            "niveau_risque":   final_risque,
            "recommandations": final_recommandations,
            "analyse_image":   description_visuelle,
            "analyse_texte":   description
        })

    except Exception as e:
        print(f"Error in /analyse: {e}")
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# ─────────────────────────────────────────────
# GET /health – quick check
# ─────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Smart Agriculture AI Module"})


if __name__ == "__main__":
    app.run(debug=True, port=8000)