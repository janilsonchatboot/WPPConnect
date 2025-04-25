# Use a imagem Node.js baseada no Alpine
FROM node:18-alpine

# Instalar dependências do Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Configurar a variável de ambiente para o Puppeteer usar o Chromium instalado
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependências inicialmente
COPY package*.json ./

# Instalar as dependências do Node.js
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "app/index.js"]
