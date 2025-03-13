#!/bin/bash

# Source common functions
source ./version_util.sh

# Initialize debug, output options, and the channel name
DEBUG=false
CHANNEL_NAME="dev"
OUTPUT_MODE="full"
VERSION_TYPE="next"

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
        --version=*)
            VERSION_TYPE="${1:10}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Function to decide and prepare next version
prepare_next_base_version() {
    local Latest_Alpha_Branch_Base_Version="$1"
    local next_base_version

    if [[ -z "$Latest_Alpha_Branch_Base_Version" ]]; then
        next_base_version=$Latest_Alpha_Branch_Base_Version
    else
        IFS='.' read -r -a version_parts <<< "$Latest_Alpha_Branch_Base_Version"
        new_minor=$((version_parts[1] + 1))
        next_base_version="${version_parts[0]}.$new_minor.0"
    fi

    echo "$next_base_version"
}

determine_current_channel_base_version() {
    local Latest_Alpha_Branch_Base_Version="$1"
    local Latest_Dev_Tag_Base_Version="$2"

    if [[ -n "$Latest_Alpha_Branch_Base_Version" ]]; then
        # LABBV exists, compare with LDTBV
        if [[ "$Latest_Alpha_Branch_Base_Version" > "$Latest_Dev_Tag_Base_Version" ]]; then
            CDCBV="$Latest_Alpha_Branch_Base_Version"
        else
            CDCBV="$Latest_Dev_Tag_Base_Version"
        fi
    else
        # LABBV does not exist, use LDTBV or default
        if [[ -n "$Latest_Dev_Tag_Base_Version" ]]; then
            CDCBV="$Latest_Dev_Tag_Base_Version"
        else
            CDCBV="1.0.0"
        fi
    fi

    echo "$CDCBV"
}

determine_channel_number() {
    local channel_name="$1"
    local base_version="$2"
    local latest_channel_tag
    local channel_number=1
    
    # Get the latest tag for the specified base version
    latest_channel_tag=$(git tag --list "v${base_version}-${channel_name}.*" | sort -V | tail -n 1)
    
    if [ -n "$latest_channel_tag" ]; then
        # Extract the channel number from the latest tag
        channel_number=$(echo "$latest_channel_tag" | grep -oP '(?<=${channel_name}\.)\d+')
        channel_number=$((channel_number + 1))
    fi
    
    echo "$channel_number"
}


Latest_Alpha_Branch_Base_Version=$(get_latest_release_branch_version "alpha")
Latest_Dev_Tag=$(get_latest_tag $CHANNEL_NAME)
Latest_Dev_Tag_Base_Version=$(determine_base_version $Latest_Dev_Tag)
Current_Dev_Channel_Base_Version=$(determine_current_channel_base_version $Latest_Alpha_Branch_Base_Version $Latest_Dev_Tag_Base_Version)
Next_Dev_Channel_Base_Version=$(prepare_next_base_version $Current_Dev_Channel_Base_Version)
Next_Dev_Channel_Number=$(determine_channel_number $CHANNEL_NAME $Next_Dev_Channel_Base_Version)
Next_Dev_Channel_Version="${Next_Dev_Channel_Base_Version}-${CHANNEL_NAME}.${Next_Dev_Channel_Number}"


################################
################################
################################
################################
################################
# Function to compute the next incremented version
compute_next_version() {
    local base_version="$1"
    local latest_channel_tag
    local current_version

    latest_channel_tag=$(get_latest_tag $CHANNEL_NAME)

    if [ -n "$latest_channel_tag" ]; then
        current_version=${latest_channel_tag#v}
    else
        current_version="${base_version}-${CHANNEL_NAME}.0"
    fi

    incremented_version=$(./version.sh "v$current_version" --increment=channel --print=full)
    echo "$incremented_version"
}

# Handle version type selection
case "$VERSION_TYPE" in
    latest)
        SELECTED_VERSION="$Current_Dev_Channel_Base_Version"
        ;;
    current)
        SELECTED_VERSION="$Current_Dev_Channel_Base_Version"
        ;;
    next)
        SELECTED_VERSION="$Next_Dev_Channel_Version"
        ;;
    *)
        SELECTED_VERSION="$Next_Dev_Channel_Version"
        ;;
esac


# Handle output according to selected mode
case "$OUTPUT_MODE" in
    base)
        echo "$Next_Dev_Channel_Base_Version"
        ;;
    channel)
        echo "$CHANNEL_NAME"
        ;;
    number)
        CHANNEL_NUMBER=$(echo "$SELECTED_VERSION" | grep -oP "(?<=$CHANNEL_NAME\.)\d+")
        echo "$CHANNEL_NUMBER"
        ;;
    full|*)
        echo "$SELECTED_VERSION"
        ;;
esac

# Additional output details
if $DEBUG; then
    echo "LABBV: $Latest_Alpha_Branch_Base_Version"
    echo "LDT: $Latest_Dev_Tag"
    echo "LDTBV: $Latest_Dev_Tag_Base_Version"
    echo "CDCBV: $Current_Dev_Channel_Base_Version"
    echo "NDCBV: $Next_Dev_Channel_Base_Version"
    echo "NDCN: $Next_Dev_Channel_Number"
    echo "NDCV: $Next_Dev_Channel_Version"
    echo "*************"
    echo "Output Mode: $OUTPUT_MODE"
    echo "Version Type: $VERSION_TYPE"
    echo "Current Version: $Current_Dev_Channel_Base_Version"
    echo "Base Version for $CHANNEL_NAME: $Next_Dev_Channel_Base_Version"
    echo "Incremented $CHANNEL_NAME Version: $Next_Dev_Channel_Version"
fi