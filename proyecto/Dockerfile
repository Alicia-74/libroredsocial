# Usa una imagen de Maven para compilar el proyecto
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /proyecto
COPY . .
RUN mvn clean package -DskipTests

# Usa una imagen ligera de Java para ejecutar el jar
FROM eclipse-temurin:21-jre
WORKDIR /proyecto
COPY --from=build /proyecto/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]