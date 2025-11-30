#!/bin/bash

# Script to update PACKAGE_ID and other object IDs after contract publish
# Usage: ./update-package-id.sh <PACKAGE_ID> [MEMBER_REGISTRY_ID] [CLUB_REGISTRY_ID]

if [ -z "$1" ]; then
    echo "Usage: ./update-package-id.sh <PACKAGE_ID> [MEMBER_REGISTRY_ID] [CLUB_REGISTRY_ID]"
    echo ""
    echo "Example:"
    echo "  ./update-package-id.sh 0x1234... 0x5678... 0x9abc..."
    echo ""
    echo "To find PACKAGE_ID after publish, look for 'Published Objects' in the publish output"
    exit 1
fi

PACKAGE_ID=$1
MEMBER_REGISTRY_ID=${2:-""}
CLUB_REGISTRY_ID=${3:-""}

ENV_FILE=".env.local"

echo "Updating $ENV_FILE with new IDs..."

# Update PACKAGE_ID
if grep -q "NEXT_PUBLIC_PACKAGE_ID" "$ENV_FILE"; then
    sed -i.bak "s|NEXT_PUBLIC_PACKAGE_ID=.*|NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID|" "$ENV_FILE"
    echo "✓ Updated NEXT_PUBLIC_PACKAGE_ID to $PACKAGE_ID"
else
    echo "NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID" >> "$ENV_FILE"
    echo "✓ Added NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID"
fi

# Update MEMBER_REGISTRY_ID if provided
if [ -n "$MEMBER_REGISTRY_ID" ]; then
    if grep -q "NEXT_PUBLIC_MEMBER_REGISTRY_ID" "$ENV_FILE"; then
        sed -i.bak "s|NEXT_PUBLIC_MEMBER_REGISTRY_ID=.*|NEXT_PUBLIC_MEMBER_REGISTRY_ID=$MEMBER_REGISTRY_ID|" "$ENV_FILE"
        echo "✓ Updated NEXT_PUBLIC_MEMBER_REGISTRY_ID to $MEMBER_REGISTRY_ID"
    else
        echo "NEXT_PUBLIC_MEMBER_REGISTRY_ID=$MEMBER_REGISTRY_ID" >> "$ENV_FILE"
        echo "✓ Added NEXT_PUBLIC_MEMBER_REGISTRY_ID=$MEMBER_REGISTRY_ID"
    fi
fi

# Update CLUB_REGISTRY_OBJECT_ID if provided
if [ -n "$CLUB_REGISTRY_ID" ]; then
    if grep -q "NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID" "$ENV_FILE"; then
        sed -i.bak "s|NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID=.*|NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID=$CLUB_REGISTRY_ID|" "$ENV_FILE"
        echo "✓ Updated NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID to $CLUB_REGISTRY_ID"
    else
        echo "NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID=$CLUB_REGISTRY_ID" >> "$ENV_FILE"
        echo "✓ Added NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID=$CLUB_REGISTRY_ID"
    fi
fi

# Remove backup file
rm -f "$ENV_FILE.bak"

echo ""
echo "✅ Update complete! Please restart your Next.js dev server for changes to take effect."
echo ""
echo "To find IDs after publish:"
echo "  1. Run: sui client publish --json"
echo "  2. Look for 'packageId' in the output"
echo "  3. Look for 'objectId' of MemberRegistry in 'created' objects"
echo "  4. Look for 'objectId' of ClubRegistry in 'created' objects"

