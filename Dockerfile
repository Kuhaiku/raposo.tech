# Usa uma imagem leve do Node
FROM node:20-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o resto do código
COPY . .

# Expõe a porta (Informativo)
EXPOSE 8080

# Comando para iniciar
CMD ["npm", "start"]