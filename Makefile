# Nome del progetto Docker Compose
PROJECT_NAME := cocktail-debacle

# Scegli tra docker-compose o docker compose a seconda di cosa è installato
DCOMPOSE := $(shell if command -v docker-compose > /dev/null 2>&1; then echo "docker-compose"; else echo "docker compose"; fi) -p $(PROJECT_NAME)

all: up-detach

# Avvia i servizi
up:
	$(DCOMPOSE) up

# Avvia i servizi in background (detached)
up-detach:
	$(DCOMPOSE) up -d

up-detach-%:
	$(DCOMPOSE) up -d $*

# Ricostruisci e avvia
up-build:
	$(DCOMPOSE) up --build

# Ferma i container
stop:
	$(DCOMPOSE) stop

# Ferma e rimuove tutto
down:
	$(DCOMPOSE) down

# Ferma e pulisce anche volumi e immagini
clean:
	$(DCOMPOSE) down --rmi all -v --remove-orphans

# Log completi
logs:
	$(DCOMPOSE) logs

# Log di un servizio specifico
logs-%:
	$(DCOMPOSE) logs $*

# Entra in un container (default shell)
exec-%:
	$(DCOMPOSE) exec -it $* bash

# Esegui qualsiasi comando docker compose (es: make d-ps → docker compose ps)
d-%:
	$(DCOMPOSE) $*

.PHONY: all up up-detach up-build stop down clean logs logs-% exec-% d-%