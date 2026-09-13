#!/bin/sh

DIR="${1:-.}"
out="test/corpus/e2e.txt"

: > "$out"

find "$DIR" -type f -name "*.ok" | while read -r f; do
    if grep -qi "expect error" "$f"; then
        continue
    fi

    printf "==================\ne2e: %s\n==================\n\n" "$(basename "$f" .ok)" >> "$out"
    cat "$f" >> "$out"
    printf "\n---\n\n(paste actual)\n\n" >> "$out"
done

