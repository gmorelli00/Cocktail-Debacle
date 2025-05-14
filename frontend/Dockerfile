FROM node:23-alpine

WORKDIR /app

RUN npm install -g @angular/cli

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto (opzionale, verrà sovrascritto dal volume)
COPY . .

# Espone la porta del dev server Angular
EXPOSE 4200

CMD ["sh", "-c", "npm install && ng serve --host 0.0.0.0"]