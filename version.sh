#!/bin/bash

# Initialize default options
INCREMENT_PART=""
PRINT_OPTION="full"
VERSION=""
VERSION_PATTERN="^v([0-9]+)\.([0-9]+)\.([0-9]+)(-([a-zA-Z]+)\.([0-9]+))?$"

# Parse input arguments
while (( "$#" )); do
    case "$1" in
        --increment=*)
            INCREMENT_PART="${1:12}"
            shift
            ;;
        --print=*)
            PRINT_OPTION="${1:8}"
            shift
            ;;
        --version)
            shift
            VERSION="$1"
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            VERSION="$1"
            shift
            ;;
    esac
done

# Increment function to update version numbers
increment_version() {
    local major=$1
    local minor=$2
    local patch=$3
    local channel_num=$4

    case "$INCREMENT_PART" in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            channel_num=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            channel_num=0
            ;;
        patch)
            patch=$((patch + 1))
            channel_num=0
            ;;
        channel)
            channel_num=$((channel_num + 1))
            ;;
        *)
            echo "Invalid increment option: $INCREMENT_PART"
            exit 1
            ;;
    esac
    echo "$major" "$minor" "$patch" "$channel_num"
}

# Validate and parse the version
if [[ "$VERSION" =~ $VERSION_PATTERN ]]; then
    major=${BASH_REMATCH[1]}
    minor=${BASH_REMATCH[2]}
    patch=${BASH_REMATCH[3]}
    channel=${BASH_REMATCH[5]}
    channel_num=${BASH_REMATCH[6]:-0}

    read new_major new_minor new_patch new_channel_num <<< $(increment_version "$major" "$minor" "$patch" "$channel_num")

    # Construct the new version
    if [[ -n "$channel" ]]; then
        NEW_VERSION="v${new_major}.${new_minor}.${new_patch}-${channel}.${new_channel_num}"
    else
        NEW_VERSION="v${new_major}.${new_minor}.${new_patch}"
    fi

    # Output according to the selected mode
    case "$PRINT_OPTION" in
        version)
            echo "v${new_major}.${new_minor}.${new_patch}"
            ;;
        channel)
            if [[ -n "$channel" ]]; then
                echo "$channel"
            else
                echo "No channel"
            fi
            ;;
        number)
            echo "${new_channel_num}"
            ;;
        full|*)
            echo "$NEW_VERSION"
            ;;
    esac
else
    echo "Invalid version format: $VERSION"
    exit 1
fi