#!/bin/sh
set -e

# If a .env file exists in /app, export its variables into the environment
if [ -f /app/.env ]; then
  set -a
  . /app/.env
  set +a
fi

# Exec Streamlit (replace the current process)
exec streamlit run main.py --server.address=0.0.0.0 --server.port=8501 --server.enableCORS=false
