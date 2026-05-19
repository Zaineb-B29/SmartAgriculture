from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from PIL import Image
import base64
import json
import re
import io
import os

app = Flask(__name__)
CORS(app)

# ── Groq client ─────────────────────────────────────────────────────────────
# Either set your key here directly (for dev/PFE) or use an env variable
GROQ_API_KEY = "GROQ_API_KEY"
client = Groq(api_key=GROQ_API_KEY)

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

SUPPORTED_FORMATS = {"PNG", "JPEG", "WEBP", "GIF", "BMP"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def detect_image_format(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return img.format
    except Exception as e:
        print(f"[WARN] Pillow could not detect format: {e}")
        return None


def compress_image(image_bytes, max_size=768):
    """Resize + compress to JPEG for faster upload to Groq."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((max_size, max_size))          # keep aspect ratio
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        compressed = buffer.getvalue()
        print(f"[INFO] Image compressed: {len(image_bytes)} → {len(compressed)} bytes")
        return compressed
    except Exception as e:
        print(f"[WARN] Compression failed, using original: {e}")
        return image_bytes


def call_groq(prompt, image_b64=None):
    """
    Single call to Groq.
    If image_b64 is provided, uses vision model with the image.
    Returns the text response or None on failure.
    """
    try:
        content = []

        if image_b64:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_b64}"
                }
            })

        content.append({
            "type": "text",
            "text": prompt
        })

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=1024,
            temperature=0.3        # lower = more consistent/factual
        )

        result = response.choices[0].message.content
        print(f"[Groq] Response: {result}")
        return result

    except Exception as e:
        print(f"[ERROR] Groq call failed: {e}")
        return None


def parse_json_response(text):
    """Extract JSON from model response even if it has extra text around it."""
    if not text:
        return {}
    text = re.sub(r"```json|```", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        # Last resort — return raw text as recommendations
        return {
            "maladie": "Analyse non structurée",
            "niveau_risque": "moyen",
            "recommandations": text,
            "description_visuelle": text
        }


# ── Main route ───────────────────────────────────────────────────────────────

@app.route("/analyse", methods=["POST"])
def analyser_besoin():
    try:
        titre       = request.form.get("titre", "")
        description = request.form.get("description", "")
        lieu        = request.form.get("lieu", "")
        image_file  = request.files.get("image")

        if not image_file:
            return jsonify({"error": "Image manquante"}), 400

        image_bytes = image_file.read()
        if not image_bytes:
            return jsonify({"error": "Image vide ou illisible"}), 400

        # Format detection
        detected_format = detect_image_format(image_bytes)
        print(f"[INFO] Filename      : {image_file.filename}")
        print(f"[INFO] Content-Type  : {image_file.content_type}")
        print(f"[INFO] Detected fmt  : {detected_format}")
        print(f"[INFO] Size (bytes)  : {len(image_bytes)}")

        if detected_format not in SUPPORTED_FORMATS:
            declared = (image_file.content_type or "").lower()
            if not any(fmt.lower() in declared for fmt in SUPPORTED_FORMATS):
                return jsonify({
                    "error": f"Format non supporté : {detected_format or 'inconnu'}. "
                             f"Formats acceptés : PNG, JPG, WEBP, GIF, BMP"
                }), 400
            print(f"[WARN] Pillow failed, trusting declared content-type: {declared}")

        # Compress image before sending to Groq (faster + cheaper)
        image_bytes = compress_image(image_bytes)
        image_b64   = base64.b64encode(image_bytes).decode("utf-8")

        # ── Single Groq call: vision + agronomic analysis in one shot ────────
        prompt = (
            "Tu es un expert agronome tunisien spécialisé dans les maladies des plantes.\n\n"
            "Analyse attentivement cette image de plante et les informations suivantes :\n"
            f"- Titre du besoin    : {titre}\n"
            f"- Description        : {description}\n"
            f"- Lieu               : {lieu}\n\n"
            "Effectue les deux tâches suivantes :\n"
            "1. Décris précisément ce que tu observes sur la plante dans l'image.\n"
            "2. Identifie la maladie la plus probable et génère exactement 2 lignes de recommandations :\n"
            "   - Ligne 1 commence par '🧪 Chimique :' suivi du traitement chimique recommandé\n"
            "   - Ligne 2 commence par '🌿 Biologique :' suivi du traitement biologique recommandé\n\n"
            "Réponds UNIQUEMENT avec ce JSON valide, sans aucun autre texte :\n"
            '{\n'
            '  "maladie": "nom précis de la maladie en français",\n'
            '  "niveau_risque": "faible ou moyen ou élevé",\n'
            '  "recommandations": "🧪 Chimique : [traitement chimique]\\n🌿 Biologique : [traitement biologique]",\n'
            '  "description_visuelle": "description de ce que tu vois sur la plante en français"\n'
            '}'
        )

        print("[INFO] Calling Groq (vision + analysis)...")
        raw      = call_groq(prompt, image_b64)
        data     = parse_json_response(raw)

        # Normalise risk level (handle English/variant responses)
        risque_map = {
            "faible": "faible", "moyen": "moyen", "élevé": "élevé",
            "eleve": "élevé", "elevé": "élevé", "élevee": "élevé",
            "low": "faible", "medium": "moyen", "high": "élevé"
        }
        raw_risque  = data.get("niveau_risque", "moyen")
        final_risque = risque_map.get(raw_risque.lower().strip(), "moyen")

        result = {
            "maladie":         data.get("maladie")         or "Maladie non identifiée",
            "niveau_risque":   final_risque,
            "recommandations": data.get("recommandations") or (
                "Contacter un expert agricole local pour une inspection physique. "
                "Isoler les plants malades pour éviter la propagation."
            ),
            "analyse_image":   data.get("description_visuelle") or "",
            "analyse_texte":   description
        }

        print(f"[INFO] Final result: {result}")
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] /analyse: {e}")
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# ── Health check ─────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    try:
        # Quick ping to Groq to verify the key works
        test = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5
        )
        groq_status = "ok" if test.choices else "error"
    except Exception as e:
        groq_status = f"error: {str(e)}"

    return jsonify({
        "status":     "ok",
        "service":    "Smart Agriculture AI Module",
        "groq":       groq_status,
        "model":      MODEL
    })


if __name__ == "__main__":
    app.run(debug=True, port=8000)