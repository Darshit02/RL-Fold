FROM python:3.11-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM base AS final
WORKDIR /app
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
COPY backend . 
COPY ml /ml
RUN mkdir -p storage/structures storage/checkpoints cache/esmfold
EXPOSE 8000