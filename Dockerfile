FROM node:18-bullseye

WORKDIR /app

# Install Chromium dan dependencies sistem
RUN apt-get update && apt-get install -y \
    chromium \
    libgbm-dev \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgtk-3-0 \
    libasound2

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
