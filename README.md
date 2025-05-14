# cocktail_debacle

# Cocktail Débâcle WebApp

## Introduzione
La **Cocktail Débâcle WebApp** è un'applicazione web interattiva che permette agli utenti di esplorare, creare e gestire ricette di cocktail, nonché recensire un tipo di cocktail in base al locale.  
Oltre alla gestione dei cocktail preferiti e alla profilazione utente, l'app include una funzionalità di ricerca dei locali grazie all'integrazione con le **Google Places API**.

## Tecnologie Utilizzate
- **Frontend:** Angular Standalone  
- **Backend:** ASP.NET  
- **Database:** SQL Server  
- **Web Server:** NGINX  
- **Containerizzazione:** Docker  
- **API di terze parti:** Google Places API  

## Funzionalità Principali
- Autenticazione e profilazione utente tramite OAuth2 (Google Login)  
- Ricerca cocktail per nome, ingredienti o tipologia  
- Ricerca locali tramite Google Places API  
- Aggiunta di recensioni su cocktail in base al locale  
- Salvataggio e visualizzazione dei cocktail preferiti  
- Area personale con i dettagli dell'utente  
- Gestione dei dati tramite SQL Server  
- Integrazione completa con Docker per l'esecuzione e il deployment  

## Requisiti
- **Docker** e **Docker Compose**  
- **API Key di Google Places**  

## Variabili d'Ambiente
Per il corretto funzionamento del progetto, creare un file **.env** nella root con i seguenti parametri:

```bash
DBSERVER=<indirizzo_server_db>
DBDATABASE=<nome_database>
DBPASSWORD=<password_database>
JWTKEY=<chiave_jwt>
JWTISSUER=<issuer_jwt>
JWTAUDIENCE=<audience_jwt>
GOOGLECLIENTID=<client_id_google>
GOOGLECLIENTSECRET=<client_secret_google>
GOOGLEAPIKEY=<api_key_google>
```


## Avvio del Progetto
Esegui i seguenti comandi per avviare il progetto:
```bash
make all
```
L'app sarà disponibile su http://localhost.

## Licenza
Questo progetto è distribuito sotto la licenza MIT.
