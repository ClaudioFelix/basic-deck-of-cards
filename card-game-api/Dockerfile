FROM maven:3.9-eclipse-temurin-21 AS build-stage

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build-stage /app/target/card-game-api-0.0.1-SNAPSHOT.jar /app/application.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/application.jar"]