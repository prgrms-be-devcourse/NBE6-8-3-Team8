chmod +x gradlew
./gradlew clean build -x test --no-daemon
pkill -f 'backend-0.0.1-SNAPSHOT.jar' || true
nohup java -jar build/libs/backend-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
