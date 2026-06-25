# ─────────────────────────── Étape 1 : build ───────────────────────────
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Couche dépendances (mise en cache tant que le pom ne change pas).
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

# Code source + packaging du fat-jar (tests ignorés : exécutés en CI).
COPY src/ src/
RUN ./mvnw -B -ntp clean package -DskipTests \
    && cp target/*-SNAPSHOT.jar /app/app.jar

# ─────────────────────────── Étape 2 : runtime ───────────────────────────
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Utilisateur non-root (bonne pratique de sécurité).
RUN groupadd -r app && useradd -r -g app app

COPY --from=build /app/app.jar app.jar
RUN mkdir -p /app/logs /app/uploads && chown -R app:app /app
USER app

EXPOSE 8080

# Options JVM container-aware ; surchargeables via JAVA_OPTS.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Vérifie la santé applicative via l'endpoint actuator.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
