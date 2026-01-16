# Usa versão leve do Node
FROM node:20-alpine

# Cria diretório da aplicação
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o código fonte e a pasta public
COPY . .

# Expõe a porta padrão
EXPOSE 8080

# Comando para iniciar
CMD ["npm", "start"]
