# Imagem base leve
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências de produção
RUN npm install

# Copia o restante do projeto
COPY . .

# Informa a porta 3000 (Padrão EasyPanel)
EXPOSE 3000

# Inicia o servidor
CMD ["npm", "start"]
