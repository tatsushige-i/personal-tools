#!/bin/bash
# feature間インポートを検出してブロックする

# file_path を抽出
FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

# src/features/<name>/ にマッチしなければ対象外
SOURCE_FEATURE=$(echo "$FILE_PATH" | grep -o 'src/features/[^/]*' | head -1 | cut -d'/' -f3)
if [ -z "$SOURCE_FEATURE" ]; then
  exit 0
fi

# コンテンツから features/<name> パターンを抽出
IMPORTED_FEATURES=$(echo "$TOOL_INPUT" | grep -oE 'features/[a-z0-9-]+' | sort -u)

for IMPORT in $IMPORTED_FEATURES; do
  TARGET_FEATURE=$(echo "$IMPORT" | cut -d'/' -f2)
  # file_path自体にもfeatures/が含まれるのでスキップ対象に
  if [ "$TARGET_FEATURE" != "$SOURCE_FEATURE" ] && [ -n "$TARGET_FEATURE" ]; then
    echo "BLOCK: feature間インポート禁止 — '$SOURCE_FEATURE' から '$TARGET_FEATURE' をインポートしています。" >&2
    echo "共有コードは src/lib/ または src/components/ に移動してください。" >&2
    exit 2
  fi
done

exit 0
