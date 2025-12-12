#!/bin/bash

# Fear Directives Integration Script
# Purpose: Automate extraction and preparation of fear.zip directives

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR="${SCRIPT_DIR}"
ZIP_FILE="${TEMP_DIR}/fear.zip"
EXTRACT_DIR="${TEMP_DIR}/extracted"
INSTRUCTIONS_DIR="$(cd "${SCRIPT_DIR}/../../../.github/instructions" && pwd)"

echo "==================================="
echo "Fear Directives Integration Script"
echo "==================================="
echo ""

# Check if fear.zip exists
if [ ! -f "${ZIP_FILE}" ]; then
    echo "❌ ERROR: fear.zip not found in ${TEMP_DIR}"
    echo ""
    echo "Please place fear.zip in the following location:"
    echo "  ${TEMP_DIR}/fear.zip"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Found fear.zip"
echo ""

# Create extraction directory
echo "📁 Creating extraction directory..."
mkdir -p "${EXTRACT_DIR}"

# Extract zip file
echo "📦 Extracting fear.zip..."
unzip -q "${ZIP_FILE}" -d "${EXTRACT_DIR}"

echo "✅ Extraction complete"
echo ""

# List extracted files
echo "📄 Extracted files:"
find "${EXTRACT_DIR}" -type f | sort | while read -r file; do
    echo "  - ${file#${EXTRACT_DIR}/}"
done
echo ""

# Analyze directive files
echo "🔍 Analyzing directive structure..."
echo ""

# Look for markdown files
MD_FILES=$(find "${EXTRACT_DIR}" -type f -name "*.md" | wc -l)
echo "  Found ${MD_FILES} markdown file(s)"

# Look for instruction files
INSTR_FILES=$(find "${EXTRACT_DIR}" -type f -name "*.instructions.md" | wc -l)
echo "  Found ${INSTR_FILES} instruction file(s)"

# Look for priority indicators
echo ""
echo "🏷️  Checking for priority metadata..."
find "${EXTRACT_DIR}" -type f -name "*.md" -exec grep -l "priority:" {} \; | while read -r file; do
    priority=$(grep "^priority:" "${file}" | head -1 | sed 's/priority://; s/ //g')
    filename=$(basename "${file}")
    echo "  - ${filename}: priority ${priority}"
done

echo ""
echo "📊 Next Steps:"
echo "  1. Review extracted files in: ${EXTRACT_DIR}"
echo "  2. Check for hierarchy and priority information"
echo "  3. Map directives to existing instruction categories"
echo "  4. Run integration process (manual or scripted)"
echo ""
echo "Current instruction files in repository:"
ls -1 "${INSTRUCTIONS_DIR}"/*.instructions.md | while read -r file; do
    filename=$(basename "${file}")
    priority=$(grep "^priority:" "${file}" 2>/dev/null | head -1 | sed 's/priority://; s/ //g' || echo "none")
    echo "  - ${filename}: priority ${priority}"
done

echo ""
echo "==================================="
echo "Extraction complete. Review files and proceed with integration."
echo "==================================="
