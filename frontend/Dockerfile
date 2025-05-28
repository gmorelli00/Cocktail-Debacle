FROM node:23-alpine

WORKDIR /app

RUN npm install -g @angular/cli

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto (opzionale, verrà sovrascritto dal volume)
COPY . .

CMD ["sh", "-c", "npm install && ng serve --host 0.0.0.0"]