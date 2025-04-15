#!/bin/bash

# Print colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping development environment...${NC}"

# Stop Docker containers
docker-compose down

echo -e "${GREEN}Development environment stopped!${NC}" 