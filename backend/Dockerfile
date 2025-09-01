# ==================================================
# 1단계: 빌드(Build) 스테이지
# 이미지 이름: amazoncorretto, 태그: 21-al2023-jdk
# ==================================================
FROM amazoncorretto:21-al2023-jdk AS builder

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradlew ./
COPY gradle ./gradle

RUN dnf install -y findutils
RUN ./gradlew --no-daemon dependencies

COPY src ./src
RUN ./gradlew --no-daemon bootJar -x test

# ==================================================
# 2단계: 실행(Runtime) 스테이지
# 이미지 이름: amazoncorretto, 태그: 21-al2023-headless
# ==================================================
FROM amazoncorretto:21-al2023-headless

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]