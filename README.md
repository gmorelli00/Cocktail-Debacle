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
