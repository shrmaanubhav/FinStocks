FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install pip requirements
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application source
COPY . /app

# Ensure the entrypoint is present and executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose Streamlit default port
EXPOSE 8000

# Use entrypoint which loads .env (if present) and starts Streamlit
ENTRYPOINT ["/app/entrypoint.sh"]
