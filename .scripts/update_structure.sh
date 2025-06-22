#!/bin/bash

# Script to generate folder structure and save it to .cursor/rules/folder-structure.mdc

# Define output file
OUTPUT_FILE=".cursor/rules/folder-structure.mdc"

# Create a new file with the required header
cat > "$OUTPUT_FILE" << EOL
---
description: Tree like folder structure of kendal-app project.
globs: 
alwaysApply: true
---

# Project folder structure.

\`\`\`
kendal-app
EOL

# Find root files first
root_files=$(find . -maxdepth 1 -type f -not -path "*/\.*" -not -path "*/bun.lockb" | sort)
if [ -n "$root_files" ]; then
    echo "$root_files" | while read -r file; do
        filename=$(basename "$file")
        echo "├── ${filename}" >> "$OUTPUT_FILE"
    done
fi

# Process directories and their files
find . -type d -not -path "." \
  -not -path "./node_modules" -not -path "./node_modules/*" \
  -not -path "./.git" -not -path "./.git/*" \
  -not -path "./.next" -not -path "./.next/*" \
  -not -path "./.vscode" -not -path "./.vscode/*" \
  -not -path "./.DS_Store" -not -path "./.DS_Store/*" \
  -not -path "./public" -not -path "./public/*" \
  | sort | while read -r dir; do
    # Calculate the depth of the directory
    depth=$(echo "$dir" | tr -cd '/' | wc -c)
    
    # Create indentation based on depth
    indent=""
    for ((i=1; i<depth; i++)); do
        indent="${indent}│   "
    done
    
    # Get the directory name
    dirname=$(basename "$dir")
    
    # Print the directory with proper indentation
    echo "${indent}├── ${dirname}" >> "$OUTPUT_FILE"
    
    # Find files in this directory
    dir_files=$(find "$dir" -maxdepth 1 -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.cursor/*" -not -path "*/bun.lockb" | sort)
    
    if [ -n "$dir_files" ]; then
        # Process each file in this directory
        echo "$dir_files" | while read -r file; do
            # Get the file name
            filename=$(basename "$file")
            
            # Print the file with proper indentation
            echo "${indent}│   ├── ${filename}" >> "$OUTPUT_FILE"
        done
    fi
done

# Close the code block
echo '```' >> "$OUTPUT_FILE"

echo "Folder structure with files has been saved to $OUTPUT_FILE" 