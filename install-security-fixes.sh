#!/bin/bash

# Security Vulnerability Fix Installation Script
# Date: December 13, 2025

echo "================================================"
echo "Security Vulnerability Fix Installation"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Backing up current package-lock.json...${NC}"
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup
    echo -e "${GREEN}✓ Backup created: package-lock.json.backup${NC}"
else
    echo -e "${YELLOW}! No package-lock.json found to backup${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Removing node_modules and package-lock.json...${NC}"
rm -rf node_modules package-lock.json
echo -e "${GREEN}✓ Cleaned up successfully${NC}"

echo ""
echo -e "${YELLOW}Step 3: Installing updated dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Installation failed. Restoring backup...${NC}"
    if [ -f "package-lock.json.backup" ]; then
        mv package-lock.json.backup package-lock.json
        npm install
    fi
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Running security audit...${NC}"
npm audit

echo ""
echo "================================================"
echo -e "${GREEN}Installation Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Review the audit results above"
echo "2. Test your application: npm run dev"
echo "3. Build the application: npm run build"
echo "4. Review SECURITY_VULNERABILITY_FIXES.md for details"
echo ""
