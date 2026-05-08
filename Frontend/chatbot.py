from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
import os, requests, re, unicodedata, json

load_dotenv()

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SPRING_API = "http://localhost:8081/api"

SYSTEM_PROMPT = """
Tu es AgroSmart AI, un assistant intelligent pour une plateforme d'agriculture intelligente.

Tu aides les clients/agriculteurs concernant :
- cultures agricoles
- maladies des plantes
- besoins agricoles
- recommandations IA
- irrigation
- météo
- engrais
- traitements
- suivi des demandes

Règles IMPORTANTES :
- Réponds en français clair et simple.
- Sois concis : maximum 4 à 5 lignes par réponse.
- Ne pose qu'une seule question de suivi si nécessaire.
- N'utilise JAMAIS de markdown : pas de **, pas de ##, pas de ***.
- Utilise des tirets simples (-) pour les listes, jamais des astérisques.
- Utilise les données réelles du projet si disponibles.
- Sois précis et utile.
"""


def normalize_text(text):
    text = text.lower().strip()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def clean_markdown(text):
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\*\s+', '- ', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def detect_intent(msg):
    msg = normalize_text(msg)
    if "maladie" in msg or "diagnostic" in msg:
        return "diagnostic"
    if "irrigation" in msg or "eau" in msg:
        return "irrigation"
    if "engrais" in msg:
        return "engrais"
    if "besoin" in msg:
        return "besoins"
    if "recommandation" in msg:
        return "recommandations"
    if "culture" in msg:
        return "cultures"
    return "general"


def call_spring_api(intent, client_id):
    try:
        if intent == "besoins":
            r = requests.get(f"{SPRING_API}/besoin/client/{client_id}", timeout=10)
        elif intent == "recommandations":
            r = requests.get(f"{SPRING_API}/recommendation/client/{client_id}", timeout=10)
        elif intent == "cultures":
            r = requests.get(f"{SPRING_API}/culture/client/{client_id}", timeout=10)
        else:
            return None
        if r.status_code == 200:
            return r.json()
        return None
    except Exception:
        return None


def build_prompt(user_message, project_data=None):
    if project_data is None:
        return f"{SYSTEM_PROMPT}\n\nQuestion : {user_message}"
    data_text = json.dumps(project_data, ensure_ascii=False, indent=2)
    return f"""{SYSTEM_PROMPT}

Question : {user_message}

Données agricoles :
{data_text}

Analyse les données et donne un résumé clair avec des conseils utiles.
"""


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    client_id = data.get("client_id")

    if not user_message:
        return jsonify({"response": "Veuillez écrire une question."})

    intent = detect_intent(user_message)

    project_data = None
    if intent in ["besoins", "recommandations", "cultures"] and client_id:
        project_data = call_spring_api(intent, client_id)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=build_prompt(user_message, project_data)
        )
        reply = clean_markdown(response.text)
        return jsonify({
            "intent": intent,
            "source": "gemini+spring",
            "project_data": project_data,
            "response": reply
        })

    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            return jsonify({
                "response": "Le service AI est temporairement limité. Veuillez réessayer dans une minute."
            })
        return jsonify({"response": f"Erreur : {err}"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)