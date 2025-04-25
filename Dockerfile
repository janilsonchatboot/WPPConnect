# Use a imagem oficial do Node.js como base
FROM node:18

# Crie um diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copie os arquivos do package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie os demais arquivos do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que o aplicativo utiliza
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["node", "index.js"]
