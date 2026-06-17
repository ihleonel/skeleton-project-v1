FROM python:3.12-slim

ARG USER_NAME=appuser
ARG USER_UID=1000
ARG USER_GID=1000

RUN groupadd -g ${USER_GID} ${USER_NAME} \
  && useradd -u ${USER_UID} -g ${USER_GID} -m ${USER_NAME}

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Install Python dependencies first (layer cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create dirs for static and media
RUN mkdir -p staticfiles mediafiles

USER ${USER_NAME}

EXPOSE 8000
