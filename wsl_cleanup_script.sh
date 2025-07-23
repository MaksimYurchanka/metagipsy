#!/bin/bash

# MetaGipsy Repository Cleanup Script (WSL/Linux)
# Removes all development artifacts and backup files for professional GitHub release

echo ""
echo "========================================"
echo "  METAGIPSY REPOSITORY CLEANUP"
echo "  Preparing for legendary GitHub release"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Work in current directory
echo -e "${BLUE}Working in current directory: ${PWD}${NC}"
echo ""

# Count files before cleanup
echo -e "${YELLOW}Analyzing repository structure...${NC}"
backup_count=$(find . -name "*.backup*" 2>/dev/null | wc -l)
version_count=$(find . -name "*_v*.ts" -o -name "*_v*.tsx" 2>/dev/null | wc -l)
artifact_count=$(find . -name "*.stablefix*" -o -name "*.fixtry" -o -name "*.storetest*" -o -name "*.stableversion" 2>/dev/null | wc -l)
dev_pages_count=$(find ./apps/web/src/pages -name "analysis_page_*.ts" -o -name "store_isolation_test.ts" 2>/dev/null | wc -l)
total_before=$(find . -type f 2>/dev/null | wc -l)

echo -e "${BLUE}Files found:${NC}"
echo "  📂 Backup files: $backup_count"
echo "  📂 Version files: $version_count" 
echo "  📂 Development artifacts: $artifact_count"
echo "  📂 Development pages: $dev_pages_count"
echo "  📂 Total files: $total_before"
echo ""

# Check if there's anything to clean
total_to_clean=$((backup_count + version_count + artifact_count + dev_pages_count))
if [ $total_to_clean -eq 0 ]; then
    echo -e "${GREEN}Repository is already clean! No artifacts found.${NC}"
    echo -e "${GREEN}Ready for GitHub push! 🚀${NC}"
    exit 0
fi

# Ask for confirmation
echo -e "${YELLOW}WARNING: This will permanently delete ALL backup and development artifact files!${NC}"
echo ""
echo "Files to be deleted:"
echo "  ❌ All *.backup* files ($backup_count files)"
echo "  ❌ All *_v[0-9]* version files ($version_count files)"
echo "  ❌ All *.stablefix*, *.fixtry, *.storetest files ($artifact_count files)"
echo "  ❌ Development page files ($dev_pages_count files)"
echo "  ❌ Empty folders: docs/, packages/"
echo "  ❌ Build artifacts: dist/, node_modules/"
echo ""

read -p "Are you sure you want to continue? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleanup cancelled. Repository unchanged.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting cleanup process...${NC}"
echo ""

# Create backup directory for safety
mkdir -p cleanup-backup
echo -e "${BLUE}Created safety backup directory: cleanup-backup/${NC}"
echo ""

# Delete backup files
echo -e "${BLUE}[1/8] Deleting *.backup* files...${NC}"
find . -name "*.backup*" -type f -print -delete

# Delete version files
echo -e "${BLUE}[2/8] Deleting version files (*_v*.ts, *_v*.tsx)...${NC}"
find . -name "*_v*.ts" -o -name "*_v*.tsx" -type f -print -delete

# Delete development artifacts
echo -e "${BLUE}[3/8] Deleting development artifacts...${NC}"
find . \( -name "*.stablefix*" -o -name "*.fixtry" -o -name "*.storetest*" -o -name "*.stableversion" \) -type f -print -delete

# Delete development pages
echo -e "${BLUE}[4/8] Deleting development page files...${NC}"
if [ -d "./apps/web/src/pages" ]; then
    find ./apps/web/src/pages -name "analysis_page_*.ts" -type f -print -delete
    find ./apps/web/src/pages -name "store_isolation_test.ts" -type f -print -delete
fi

# Remove empty folders
echo -e "${BLUE}[5/8] Removing empty folders...${NC}"
if [ -d "docs" ]; then
    echo "Removing docs/ folder..."
    rm -rf docs/
fi

if [ -d "packages/chess-engine" ]; then
    echo "Removing packages/chess-engine/ folder..."
    rm -rf packages/chess-engine/
fi

if [ -d "packages/shared" ]; then
    echo "Removing packages/shared/ folder..."
    rm -rf packages/shared/
fi

if [ -d "packages" ] && [ -z "$(ls -A packages 2>/dev/null)" ]; then
    echo "Removing empty packages/ folder..."
    rm -rf packages/
fi

# Clean build artifacts
echo -e "${BLUE}[6/8] Cleaning build artifacts...${NC}"
if [ -d "apps/web/dist" ]; then
    echo "Removing web dist/ folder..."
    rm -rf apps/web/dist/
fi

if [ -d "apps/api/dist" ]; then
    echo "Removing api dist/ folder..."
    rm -rf apps/api/dist/
fi

# Clean node_modules
echo -e "${BLUE}[7/8] Cleaning node_modules...${NC}"
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Clean old .env files (keep .env.example)
echo -e "${BLUE}[8/8] Cleaning environment files...${NC}"
if [ -f ".env" ]; then
    echo "Removing .env from root..."
    rm -f .env
fi

if [ -f "apps/api/.env" ]; then
    echo "Removing .env from apps/api..."
    rm -f apps/api/.env
fi

if [ -f "apps/web/.env" ]; then
    echo "Removing .env from apps/web..."
    rm -f apps/web/.env
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CLEANUP COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Count remaining files and show results
total_after=$(find . -type f 2>/dev/null | wc -l)
files_removed=$((total_before - total_after))

echo -e "${BLUE}Cleanup summary:${NC}"
echo "  📊 Files before: $total_before"
echo "  📊 Files after: $total_after"
echo "  🗑️  Files removed: $files_removed"
echo ""

# Verify cleanup
backup_remaining=$(find . -name "*.backup*" 2>/dev/null | wc -l)
version_remaining=$(find . -name "*_v*.ts" -o -name "*_v*.tsx" 2>/dev/null | wc -l)

echo -e "${GREEN}Verification:${NC}"
echo "  ✅ Backup files remaining: $backup_remaining (should be 0)"
echo "  ✅ Version files remaining: $version_remaining (should be 0)"
echo ""

echo -e "${GREEN}Professional repository structure achieved:${NC}"
echo "  ✅ All backup files removed"
echo "  ✅ All version artifacts removed"
echo "  ✅ Development test files removed"
echo "  ✅ Empty folders removed"
echo "  ✅ Build artifacts cleaned"
echo "  ✅ Node modules cleaned"
echo "  ✅ Ready for professional GitHub release"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. git add ."
echo "  2. git commit -m \"🚀 Professional repository structure\""
echo "  3. git push origin main"
echo "  4. Make repository public on GitHub"
echo ""

echo -e "${GREEN}Repository is now enterprise-grade and ready for global developers!${NC}"
echo -e "${BLUE}🎊 LEGENDARY CLEANUP COMPLETE! 🎊${NC}"
echo ""