# Cocktail Débâcle WebApp

## Introduction
The **Cocktail Débâcle WebApp** is an interactive web application that allows users to explore, create, and manage cocktail recipes, as well as review a specific type of cocktail based on the venue.  
In addition to managing favorite cocktails and user profiling, the app includes a venue search feature thanks to integration with the **Google Places API**.

## Technologies Used
- **Frontend:** Angular Standalone  
- **Backend:** ASP.NET  
- **Database:** SQL Server  
- **Web Server:** NGINX  
- **Containerization:** Docker  
- **Third-Party API:** Google Places API  

## Main Features
- User authentication and profiling via OAuth2 (Google Login)  
- Search for cocktails by name, ingredients, or type  
- Venue search using Google Places API  
- Add reviews on cocktails based on the venue  
- Save and display favorite cocktails  
- Personal area with user details  
- Data management via SQL Server  
- Complete integration with Docker for execution and deployment  

## Requirements
- **Docker** and **Docker Compose**  
- **Google Places API Key**  

## Environment Variables
To ensure the project works correctly, create a **.env** file in the root directory with the following parameters:

```bash
DBSERVER=<db_server_address>
DBDATABASE=<database_name>
DBPASSWORD=<database_password>
JWTKEY=<jwt_key>
JWTISSUER=<jwt_issuer>
JWTAUDIENCE=<jwt_audience>
GOOGLECLIENTID=<google_client_id>
GOOGLECLIENTSECRET=<google_client_secret>
GOOGLEAPIKEY=<google_api_key>
```

## Starting the Project
Run the following commands to start the project:
```bash
make all
```
The app will be available at http://localhost.

## License
This project is distributed under the MIT License.

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
