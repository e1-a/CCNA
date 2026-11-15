#!/bin/sh
# Rebuilds index.html (the single-file trainer) from its pieces.
# The pieces may sit in src/ or right next to this script.
cd "$(dirname "$0")" || exit 1
if [ -d src ]; then S=src; else S=.; fi
cat "$S/head.html" "$S/questions.js" "$S/sheets.js" "$S/app.js" "$S/tail.html" > index.html.tmp && mv index.html.tmp index.html
echo "Built index.html from $S/"
