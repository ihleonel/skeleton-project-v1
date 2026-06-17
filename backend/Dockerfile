FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache)
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/development.txt

# Copy source
COPY . .

# Create dirs for static and media
RUN mkdir -p staticfiles mediafiles

EXPOSE 8000
