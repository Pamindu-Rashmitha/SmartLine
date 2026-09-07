# Set JAVA_HOME for all recipe processes
export JAVA_HOME := C:\Program Files\Java\jdk-21

.PHONY: server client build test

# Run backend Spring Boot development server
server:
	cd backend && mvnw.cmd spring-boot:run

# Run frontend React development server
client:
	cd frontend && npm run dev

# Build both backend and frontend
build:
	cd backend && mvnw.cmd clean package -DskipTests
	cd frontend && npm run build

# Run backend tests
test:
	cd backend && mvnw.cmd test