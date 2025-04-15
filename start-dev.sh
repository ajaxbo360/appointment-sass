#!/bin/bash

# Print colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting development environment...${NC}"

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for containers to be ready
echo -e "${YELLOW}Waiting for containers to be ready...${NC}"
sleep 15  # Give more time for the entrypoint script to run

# Check if backend container is running
if [ "$(docker ps -q -f name=backend)" ]; then
    # Run migrations and seeders
    echo -e "${YELLOW}Running database migrations and seeders...${NC}"
    docker exec -i backend php artisan migrate:fresh --seed --force
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Migrations and seeders completed successfully!${NC}"
    else
        echo -e "${RED}Failed to run migrations and seeders${NC}"
        exit 1
    fi
else
    echo -e "${RED}Backend container is not running! Check docker-compose logs for details.${NC}"
    docker-compose logs backend
    exit 1
fi

# Check if frontend container is running
if [ "$(docker ps -q -f name=frontend)" ]; then
    # Install frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    docker exec -i frontend npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Frontend dependencies installed successfully!${NC}"
    else
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        exit 1
    fi

    # Build frontend (optional)
    # echo -e "${YELLOW}Building frontend...${NC}"
    # docker exec -i frontend npm run build
    # if [ $? -eq 0 ]; then
    #     echo -e "${GREEN}Frontend built successfully!${NC}"
    # else
    #     echo -e "${RED}Failed to build frontend${NC}"
    #     exit 1
    # fi
else
    echo -e "${RED}Frontend container is not running! Check docker-compose logs for details.${NC}"
    docker-compose logs frontend
    exit 1
fi

# Add this after starting containers
echo -e "${YELLOW}Checking frontend health...${NC}"
attempt=1
max_attempts=10
until $(curl --output /dev/null --silent --head --fail http://localhost:3000) || [ $attempt -gt $max_attempts ]; do
    echo -e "${YELLOW}Waiting for frontend to be ready (attempt $attempt/$max_attempts)...${NC}"
    sleep 5
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Frontend is not responding after $max_attempts attempts${NC}"
    docker-compose logs frontend
else
    echo -e "${GREEN}Frontend is ready!${NC}"
fi

# Add this after the health checks
echo -e "${YELLOW}Verifying port mappings...${NC}"
docker port backend
docker port frontend

# Check for duplicate migrations
echo -e "${YELLOW}Checking for duplicate migrations...${NC}"
docker exec -i backend ./check-migrations.sh

echo -e "${GREEN}Development environment is ready!${NC}"
echo -e "${GREEN}Backend: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}" 