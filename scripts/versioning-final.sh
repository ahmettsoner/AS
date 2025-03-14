#!/bin/bash

# Source the utility functions
source ./version_util.sh

# Initialize debug and output options
DEBUG=false
CHANNEL_NAME="stable"
OUTPUT_MODE="full"

# Parse input arguments
while (( "$#" )); do
    case "$1" in
        --debug)
            DEBUG=true
            shift
            ;;
        --print=*)
            OUTPUT_MODE="${1:8}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Function to determine the base version using the latest prerelease tag
get_base_version() {
    local base_version

    if [[ -n "$LATEST_STABLE" ]]; then
        base_version=$(determine_base_version "$LATEST_STABLE")
    elif [[ -n "$LATEST_BETA" ]]; then
        base_version=$(determine_base_version "$LATEST_BETA")
    elif [[ -n "$LATEST_ALPHA" ]]; then
        base_version=$(determine_base_version "$LATEST_ALPHA")
    else
        base_version="1.0.0"
    fi

    echo "$base_version"
}

# Function to increment the stable version using version.sh
get_incremented_version() {
    local base_version=$1
    local current_version="${base_version}"

    if [[ -n "$LATEST_STABLE" ]]; then
        current_version=$(echo "$LATEST_STABLE" | sed 's/^v//')
    fi

    # Use version.sh to increment the patch number for stable
    incremented_version=$(./version.sh "v$current_version" --increment=patch --print=full)
    echo "$incremented_version"
}

# Get the base version
BASE_VERSION=$(get_base_version)

# Calculate the new stable version
STABLE_VERSION=$(get_incremented_version "$BASE_VERSION")

# Handle output modes
case "$OUTPUT_MODE" in
    base)
        echo "$BASE_VERSION"
        ;;
    channel)
        echo "$CHANNEL_NAME"
        ;;
    number)
        PATCH_NUMBER=$(echo "$STABLE_VERSION" | grep -oP "(?<=\.)\d+(?![^\-]*\.)$")
        echo "$PATCH_NUMBER"
        ;;
    full|*)
        echo "$STABLE_VERSION"
        
        if $DEBUG; then
            echo "Channel: $CHANNEL_NAME"
            echo "Base Version for $CHANNEL_NAME: $BASE_VERSION"
            echo "Incremented $CHANNEL_NAME Version: $STABLE_VERSION"
        fi
        ;;
esac