#!/bin/bash

# Function to find the latest tag based on version components
get_latest_tag() {
    local tag_type=$1
    local LATEST_TAG=""
    
    TAGS=$(git tag --list | grep -E "^v[0-9]+\.[0-9]+\.0-${tag_type}\.[0-9]+$")

    IFS=$'\n' read -rd '' -a TAG_ARRAY <<<"$TAGS"
    
    for tag in "${TAG_ARRAY[@]}"; do
        if [[ -z "$LATEST_TAG" ]]; then
            LATEST_TAG="$tag"
            continue
        fi

        IFS='.-' read -r -a LATEST_PARTS <<< "${LATEST_TAG//[a-zA-Z]/}"
        IFS='.-' read -r -a CURRENT_PARTS <<< "${tag//[a-zA-Z]/}"

        if (( CURRENT_PARTS[0] > LATEST_PARTS[0] || 
              (CURRENT_PARTS[0] == LATEST_PARTS[0] && CURRENT_PARTS[1] > LATEST_PARTS[1]) || 
              (CURRENT_PARTS[0] == LATEST_PARTS[0] && CURRENT_PARTS[1] == LATEST_PARTS[1] && CURRENT_PARTS[4] > LATEST_PARTS[4]) )); then
            LATEST_TAG="$tag"
        fi
    done

    echo "$LATEST_TAG"
}
# Function to find the latest version from branches based on a specific branch name
get_latest_release_branch_version() {
    local branch_name="$1"
    local LATEST_VERSION=""
    local BRANCHES

    # Fetch local branches that match the given branch name pattern
    BRANCHES=$(git branch --list "release/[0-9]*.[0-9]*.0-${branch_name}")

    while IFS= read -r branch; do
        # Strip the prefix and parse the version numbers
        if [[ "$branch" =~ release/([0-9]+)\.([0-9]+)\.[0-9]+-${branch_name} ]]; then
            CURRENT_MAJOR="${BASH_REMATCH[1]}"
            CURRENT_MINOR="${BASH_REMATCH[2]}"
            CURRENT_VERSION="$CURRENT_MAJOR.$CURRENT_MINOR.0"

            if [[ -z "$LATEST_VERSION" ]]; then
                LATEST_VERSION="$CURRENT_VERSION"
            else
                IFS='.' read -r -a LATEST_PARTS <<< "$LATEST_VERSION"
                IFS='.' read -r -a CURRENT_PARTS <<< "$CURRENT_VERSION"

                if (( CURRENT_PARTS[0] > LATEST_PARTS[0] || 
                      (CURRENT_PARTS[0] == LATEST_PARTS[0] && CURRENT_PARTS[1] > LATEST_PARTS[1]) )); then
                    LATEST_VERSION="$CURRENT_VERSION"
                fi
            fi
        fi
    done <<< "$BRANCHES"

    echo "$LATEST_VERSION"
}

# Function to determine base version from the current branch
check_branch_version() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" =~ release/v([0-9]+)\.([0-9]+)\.[0-9]+ ]]; then
        VERSION_MAJOR="${BASH_REMATCH[1]}"
        VERSION_MINOR="${BASH_REMATCH[2]}"
        echo "$VERSION_MAJOR.$VERSION_MINOR.0"
    else
        echo "Branch does not follow the standard release naming convention."
        exit 1
    fi
}

# Function to determine the base version
determine_base_version() {
    local latest_tag=$1

    if [[ -z "$latest_tag" ]]; then
        echo "1.0.0"
    else
        echo "$latest_tag" | sed -E 's/v([0-9]+)\.([0-9]+)\.0[-.][a-z]+\.[0-9]+/\1.\2.0/'
    fi
}