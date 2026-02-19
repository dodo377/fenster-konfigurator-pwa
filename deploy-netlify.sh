#!/bin/bash

# Netlify Deploy Script für Fenster-Konfigurator PWA

echo "🚀 Deploying Fenster-Konfigurator to Netlify..."

# Prüfen ob netlify-cli installiert ist
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI nicht gefunden!"
    echo "📦 Installiere mit: npm install -g netlify-cli"
    echo "🔑 Danach login mit: netlify login"
    exit 1
fi

# Status anzeigen
echo "📋 Status:"
netlify status

# Deploy
echo "🌐 Deploying..."
netlify deploy --prod --dir=.

echo "✅ Deployment abgeschlossen!"
echo "🔗 Deine PWA ist jetzt über HTTPS erreichbar"
