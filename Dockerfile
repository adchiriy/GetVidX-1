# Production Dockerfile for GetVidX Media Backend
FROM node:22-bookworm-slim

# Install system dependencies: ffmpeg for media remuxing, python3 and curl for yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install standalone yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app

# Install Node dependencies first for Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build Vite client production bundle (served statically by Express in production)
RUN npm run build

# Expose default HTTP port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start long-running Express server
CMD ["npm", "start"]
