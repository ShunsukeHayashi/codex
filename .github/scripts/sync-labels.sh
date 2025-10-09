#!/bin/bash
# ラベル同期スクリプト - labels.ymlからGitHubラベルを作成/更新

set -euo pipefail

LABELS_FILE=".github/labels.yml"
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "🏷️  Syncing labels to GitHub repository: $REPO"
echo ""

# YAMLファイルからラベル情報を抽出（簡易パーサー）
parse_labels() {
    local name=""
    local color=""
    local description=""

    while IFS= read -r line; do
        # コメント行とセクションヘッダーをスキップ
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ "$line" =~ ^[[:space:]]*$ ]]; then
            continue
        fi

        # name行を検出
        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*\"(.+)\" ]]; then
            name="${BASH_REMATCH[1]}"
        fi

        # color行を検出
        if [[ "$line" =~ ^[[:space:]]*color:[[:space:]]*\"(.+)\" ]]; then
            color="${BASH_REMATCH[1]}"
        fi

        # description行を検出
        if [[ "$line" =~ ^[[:space:]]*description:[[:space:]]*\"(.+)\" ]]; then
            description="${BASH_REMATCH[1]}"

            # 全ての情報が揃ったらラベルを作成/更新
            if [[ -n "$name" ]] && [[ -n "$color" ]] && [[ -n "$description" ]]; then
                create_or_update_label "$name" "$color" "$description"
                name=""
                color=""
                description=""
            fi
        fi
    done < "$LABELS_FILE"
}

# ラベルを作成または更新
create_or_update_label() {
    local name="$1"
    local color="$2"
    local description="$3"

    # 既存ラベルをチェック
    if gh label list --json name -q ".[].name" | grep -Fxq "$name"; then
        echo "  ✏️  Updating: $name"
        gh label edit "$name" --color "$color" --description "$description" 2>/dev/null || {
            echo "    ⚠️  Failed to update: $name"
        }
    else
        echo "  ✨ Creating: $name"
        gh label create "$name" --color "$color" --description "$description" 2>/dev/null || {
            echo "    ⚠️  Failed to create: $name"
        }
    fi
}

# メイン処理
main() {
    if [[ ! -f "$LABELS_FILE" ]]; then
        echo "❌ Error: $LABELS_FILE not found"
        exit 1
    fi

    if ! command -v gh &> /dev/null; then
        echo "❌ Error: GitHub CLI (gh) is not installed"
        exit 1
    fi

    parse_labels

    echo ""
    echo "✅ Label sync complete!"
    echo ""
    echo "📊 Current label count:"
    gh label list --json name -q '. | length'
}

main
