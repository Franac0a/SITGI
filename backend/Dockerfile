FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
# El seed es idempotente: en el primer arranque crea el director y carga los datos.
CMD ["sh", "-c", "node src/scripts/seed.js && node app.js"]
