#!/bin/bash

# Source utility functions
source ./version_util.sh

# Initialize debug and output options
DEBUG=false
CHANNEL_NAME="alpha"
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

# Function to get base version using the latest release branch if available
get_base_version() {
    local base_version
    local branch_base=$(get_latest_release_branch_version)

    if [[ -n "$branch_base" ]]; then
        base_version="$branch_base"
    else
        base_version="1.0.0"
    fi

    echo "$base_version"
}

# Function to find the latest channel tag and determine the base version
get_incremented_version() {
    local base_version=$1
    local latest_channel_tag=$(get_latest_tag "$CHANNEL_NAME")
    local current_version

    if [[ -n "$latest_channel_tag" ]]; then
        current_version=${latest_channel_tag#v}
    else
        current_version="${base_version}-${CHANNEL_NAME}.0"
    fi

    # Use version.sh to increment the channel number
    incremented_version=$(./version.sh "v$current_version" --increment=channel --print=full)
    echo "$incremented_version"
}

# Get the base version
BASE_VERSION=$(get_base_version)

# Calculate the new channel version
CHANNEL_VERSION=$(get_incremented_version "$BASE_VERSION")

# Handle output modes
case "$OUTPUT_MODE" in
    base)
        echo "$BASE_VERSION"
        ;;
    channel)
        echo "$CHANNEL_NAME"
        ;;
    number)
        CHANNEL_NUMBER=$(echo "$CHANNEL_VERSION" | grep -oP "(?<=${CHANNEL_NAME}\.)\d+")
        echo "$CHANNEL_NUMBER"
        ;;
    full|*)
        echo "$CHANNEL_VERSION"
        
        if $DEBUG; then
            echo "Channel: $CHANNEL_NAME"
            echo "Base Version for $CHANNEL_NAME: $BASE_VERSION"
            echo "Incremented $CHANNEL_NAME Version: $CHANNEL_VERSION"
        fi
        ;;
esac