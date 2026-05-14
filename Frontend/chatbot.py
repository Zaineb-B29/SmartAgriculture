from flask import Flask, request, jsonify
from flask_cors import CORS

chatbot = Flask(__name__)
CORS(chatbot)

SPRING_API = "http://localhost:8081/api"


@chatbot.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        print("📩 DATA:", data)
        message = data.get("message", "").lower()
        print("💬 MESSAGE:", message)

        # =========================
        # IRRIGATION
        # =========================
        if "irrigation" in message or "eau" in message or "arrosage" in message:
            return jsonify({
                "response":
                "💧 Pour une irrigation intelligente : utilisez des capteurs d'humidité du sol, "
                "planifiez l'arrosage aux heures fraîches et adaptez les doses selon les cultures et la météo."
            })

        # =========================
        # SOL / FERTILISATION
        # =========================
        elif "sol" in message or "fertilisation" in message or "engrais" in message or "nutriments" in message:
            return jsonify({
                "response":
                "🌱 Un bon sol agricole nécessite un équilibre en azote (N), phosphore (P) et potassium (K). "
                "Analysez votre sol régulièrement et utilisez des engrais organiques pour une agriculture durable."
            })

        # =========================
        # METEO / CLIMAT
        # =========================
        elif "météo" in message or "meteo" in message or "climat" in message or "température" in message or "pluie" in message:
            return jsonify({
                "response":
                "🌤️ Suivez les prévisions météo locales pour planifier vos semis et récoltes. "
                "Utilisez des abris ou serres pour protéger vos cultures des gelées et fortes chaleurs."
            })

        # =========================
        # MALADIES / RAVAGEURS
        # =========================
        elif "maladie" in message or "ravageur" in message or "insecte" in message or "parasite" in message or "champignon" in message:
            return jsonify({
                "response":
                "🐛 Pour lutter contre les maladies et ravageurs : pratiquez la rotation des cultures, "
                "utilisez des biopesticides, installez des pièges à phéromones et surveillez vos plants régulièrement."
            })

        # =========================
        # CAPTEURS / IOT
        # =========================
        elif "capteur" in message or "iot" in message or "capteurs" in message or "sensor" in message or "connecté" in message:
            return jsonify({
                "response":
                "📡 Smart Agriculture utilise des capteurs IoT pour mesurer l'humidité du sol, la température, "
                "la luminosité et les niveaux de CO₂. Ces données permettent d'automatiser l'irrigation et la fertilisation."
            })

        # =========================
        # DRONES / TECH
        # =========================
        elif "drone" in message or "ia" in message or "intelligence artificielle" in message or "technologie" in message:
            return jsonify({
                "response":
                "🚁 Les drones agricoles permettent la surveillance des cultures, la détection précoce des maladies "
                "et l'épandage précis d'intrants. L'IA analyse les images pour optimiser les rendements."
            })

        # =========================
        # SEMIS / PLANTATION
        # =========================
        elif "semis" in message or "plantation" in message or "planter" in message or "semer" in message or "graine" in message:
            return jsonify({
                "response":
                "🌾 Pour réussir vos semis : respectez les calendriers saisonniers, préparez bien le sol, "
                "maintenez une profondeur de semis adaptée à chaque culture et assurez une bonne humidité initiale."
            })

        # =========================
        # RECOLTE
        # =========================
        elif "récolte" in message or "recolte" in message or "rendement" in message or "production" in message:
            return jsonify({
                "response":
                "🌽 Pour maximiser vos rendements : récoltez au bon stade de maturité, stockez dans de bonnes conditions "
                "et utilisez des outils d'agriculture de précision pour réduire les pertes post-récolte."
            })

        # =========================
        # PROJET / PLATEFORME / CONTEXTE
        # =========================
        elif "projet" in message or "smart agriculture" in message or "plateforme" in message or "application" in message or "contexte" in message:
            return jsonify({
                "response":
                "🌾 Smart Agriculture est une plateforme intelligente de gestion agricole. "
                "Elle combine Angular, Spring Boot, des capteurs IoT et l'IA pour optimiser "
                "l'irrigation, la fertilisation et la surveillance des cultures en temps réel."
            })

        # =========================
        # BESOINS / CONSEILS PERSONNALISÉS
        # =========================
        elif "besoin" in message or "conseil" in message or "recommandation" in message or "aide-moi" in message:
            return jsonify({
                "response":
                "📋 Pour des recommandations personnalisées, dites-moi :\n"
                "1️⃣ Quel type de culture ?\n"
                "2️⃣ Votre région / climat ?\n"
                "3️⃣ Superficie de votre exploitation ?\n"
                "Je pourrai ainsi vous guider au mieux !"
            })

        # =========================
        # BONJOUR
        # =========================
        elif "bonjour" in message or "salut" in message or "hello" in message or "bonsoir" in message:
            return jsonify({
                "response":
                "👋 Bonjour ! Je suis votre assistant Smart Agriculture. "
                "Posez-moi vos questions sur l'irrigation, les cultures, les maladies, les capteurs IoT ou la météo !"
            })

        # =========================
        # AIDE
        # =========================
        elif "aide" in message or "help" in message or "que peux-tu" in message or "fonctionnalité" in message:
            return jsonify({
                "response":
                "ℹ️ Je peux vous aider sur :\n"
                "💧 Irrigation & gestion de l'eau\n"
                "🌱 Sol & fertilisation\n"
                "🌤️ Météo & climat\n"
                "🐛 Maladies & ravageurs\n"
                "📡 Capteurs IoT & technologie\n"
                "🚁 Drones & Intelligence Artificielle\n"
                "🌾 Semis & plantation\n"
                "🌽 Récolte & rendement"
            })

        # =========================
        # HORS SUJET
        # =========================
        else:
            return jsonify({
                "response":
                "🤔 Je ne suis pas sûr de comprendre votre question.\n"
                "Je peux vous aider sur :\n"
                "💧 Irrigation · 🌱 Sol & engrais · 🌤️ Météo\n"
                "🐛 Maladies · 📡 Capteurs IoT · 🌾 Semis & récolte\n"
                "Reformulez votre question ou choisissez un thème !"
            })

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return jsonify({
            "response": f"Erreur serveur : {str(e)}"
        }), 500


if __name__ == "__main__":
    chatbot.run(debug=True, port=5000, host='0.0.0.0')