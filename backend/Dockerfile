# # STAGE 1: build
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# WORKDIR /src

# # Copia i file di progetto e ripristina le dipendenze
# COPY ["backend.csproj", "./"]
# RUN dotnet restore

# # Copia il resto dei file e compila
# COPY . .
# RUN dotnet publish -c Release -o /app/publish

# # STAGE 2: runtime
# FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
# WORKDIR /app
# COPY --from=build /app/publish .

# # Espone la porta (default)
# EXPOSE 5000
# ENTRYPOINT ["dotnet", "backend.dll"]

FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /src

# Copia solo i file .csproj per il restore (più efficiente)
COPY *.csproj ./
RUN dotnet restore

# Ora installa dotnet-ef in modo globale
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Poi copia il resto del progetto
COPY . .

EXPOSE 5000

ENTRYPOINT ["dotnet", "run", "--urls=http://0.0.0.0:5000"]
