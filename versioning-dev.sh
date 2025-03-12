#!/bin/bash

# Source common functions
source ./version_util.sh

# Initialize debug and output options
DEBUG=false
BASE_OPTION="tag"
CHANNEL_NAME="dev"
OUTPUT_MODE="full"

# Parse input arguments
while (( "$#" )); do
    case "$1" in
        --debug)
            DEBUG=true
            shift
            ;;
        --base=branch|tag)
            BASE_OPTION="${1:7}"
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

# Function to get base version from branch or tag
get_base_version() {
    local base_version
  
    if [[ "$BASE_OPTION" == "branch" ]]; then
        base_version=$(get_latest_release_branch_version)
        if [[ -z "$base_version" ]]; then
            base_version="1.0.0"
        else
            # Prepare for a new minor version
            IFS='.' read -r -a version_parts <<< "$base_version"
            new_minor=$((version_parts[1] + 1))
            base_version="${version_parts[0]}.$new_minor.0"
        fi
    else
        local tags=$(git tag)
        
        if [ -z "$tags" ]; then
            base_version="1.0.0"
        else
            local latest_alpha=$(get_latest_tag "alpha")
            
            if [ -z "$latest_alpha" ]; then
                base_version="1.0.0"
            else
                base_version=$(determine_base_version "$latest_alpha")

                # Prepare for a new minor version
                major=$(echo "$base_version" | cut -d. -f1)
                minor=$(echo "$base_version" | cut -d. -f2)
                new_minor=$((minor + 1))
                base_version="$major.$new_minor.0"
            fi
        fi
    fi
    echo "$base_version"
}

# Get base version
BASE_VERSION=$(get_base_version)

# Function to get the current channel number and increment using version.sh
get_incremented_version() {
    local base_version=$1
    local latest_channel_tag=$(get_latest_tag $CHANNEL_NAME)
    local current_version

    if [ -n "$latest_channel_tag" ]; then
        current_version=${latest_channel_tag#v}
    else
        current_version="${base_version}-${CHANNEL_NAME}.0"
    fi

    # Use version.sh to increment the channel number
    incremented_version=$(./version.sh "v$current_version" --increment=channel --print=full)
    echo "$incremented_version"
}

# Get incremented full channel version
CHANNEL_VERSION=$(get_incremented_version "$BASE_VERSION")

# Output according to the selected mode
case "$OUTPUT_MODE" in
    base)
        echo "$BASE_VERSION"
        ;;
    channel)
        echo "$CHANNEL_NAME"
        ;;
    number)
        CHANNEL_NUMBER=$(echo "$CHANNEL_VERSION" | grep -oP '(?<=dev\.)\d+')
        echo "$CHANNEL_NUMBER"
        ;;
    full|*)
        echo "$CHANNEL_VERSION"
        
        if $DEBUG; then
            echo "Base Option: $BASE_OPTION"
            echo "Base Version for $CHANNEL_NAME: $BASE_VERSION"
            echo "Incremented $CHANNEL_NAME Version: $CHANNEL_VERSION"
        fi
        ;;
esac