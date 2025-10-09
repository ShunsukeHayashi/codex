# ライセンス遵守ガイド - Codex CLI フォークプロジェクト

**作成日**: 2025-10-10
**対象**: Codex CLI (OpenAI) のフォークプロジェクト
**重要度**: CRITICAL

---

## ⚠️ 重要な前提

このプロジェクトは **OpenAI が著作権を保有する Codex CLI** のフォークです。

- **オリジナル**: https://github.com/openai/codex
- **フォーク**: https://github.com/ShunsukeHayashi/codex
- **ライセンス**: Apache License 2.0
- **著作権**: Copyright 2025 OpenAI

すべての改変・派生作品は **Apache License 2.0 の条項に厳格に従う必要があります**。

---

## 📜 Apache License 2.0 の主要要件

### 1. ライセンス継承 (第4条a)

**要件**:
> You must give any other recipients of the Work or Derivative Works a copy of this License

**遵守方法**:
```bash
# LICENSEファイルを保持 (削除・変更禁止)
ls /Users/shunsuke/Dev/codex/LICENSE
# → 存在することを確認

# 配布時は必ずLICENSEファイルを含める
# GitHub Pages、npm package、Docker imageなど全てに適用
```

**禁止事項**:
- ❌ LICENSEファイルの削除
- ❌ LICENSEファイルの内容変更
- ❌ Apache License 2.0以外のライセンスへの変更

---

### 2. 変更の明示 (第4条b)

**要件**:
> You must cause any modified files to carry prominent notices stating that You changed the files

**遵守方法**:

#### オプション1: ファイル先頭にコメント追加 (推奨)
```rust
// Copyright 2025 OpenAI
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by Shunsuke Hayashi, 2025-10-10
// Changes: Added Miyabi integration via MCP protocol

use codex_core::...;
```

#### オプション2: CONTRIBUTORSファイル作成
```bash
# /Users/shunsuke/Dev/codex/CONTRIBUTORS.md を作成
cat > CONTRIBUTORS.md <<'EOF'
# Contributors to Codex CLI Fork

## Original Work
- Copyright 2025 OpenAI
- Repository: https://github.com/openai/codex
- License: Apache 2.0

## Modifications
- **Shunsuke Hayashi** (2025-10-10)
  - Added Miyabi integration (codex-miyabi/)
  - Implemented MCP server for autonomous agents
  - See INTEGRATION_PLAN_MIYABI.md for details
EOF
```

#### オプション3: COMMITメッセージで明示
```bash
git commit -m "feat(miyabi): add MCP server integration

Modified files:
- codex-rs/cli/src/main.rs
- codex-rs/core/src/miyabi_integration.rs (new)

Changes: Integrated Miyabi autonomous agent framework via MCP protocol.

Original work: Copyright 2025 OpenAI
Modified by: Shunsuke Hayashi

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### 3. 帰属表示の保持 (第4条c)

**要件**:
> You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work

**遵守方法**:

#### NOTICEファイルの保持と拡張
```bash
# 既存のNOTICEファイル
cat /Users/shunsuke/Dev/codex/NOTICE
# → "OpenAI Codex
#     Copyright 2025 OpenAI
#
#     This project includes code derived from [Ratatui]..."

# フォークプロジェクトの場合、NOTICEに追記
cat >> NOTICE <<'EOF'

## Fork Modifications

This is a fork of the original Codex CLI project:
- Original: https://github.com/openai/codex
- Fork: https://github.com/ShunsukeHayashi/codex
- Fork Maintainer: Shunsuke Hayashi

Modifications:
- Integration with Miyabi autonomous agent framework
- See INTEGRATION_PLAN_MIYABI.md for detailed changes
EOF
```

#### 全ファイルで著作権表示を保持
```bash
# オリジナルの著作権表示が含まれるファイルを検索
grep -r "Copyright.*OpenAI" codex-rs/ | head -5

# これらのファイルを編集する際は、著作権表示を削除しない
# 例:
# ❌ 削除禁止: // Copyright 2025 OpenAI
# ✅ 追記可能: // Modified by Shunsuke Hayashi, 2025
```

---

### 4. NOTICEファイルの配布 (第4条d)

**要件**:
> If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices

**遵守方法**:

```bash
# 配布物に必ず含める
# - GitHub repository: NOTICE (既存)
# - npm package: package.jsonのfilesフィールドに含める
# - Docker image: COPYコマンドで含める
# - バイナリ配布: README/ドキュメントに記載

# npm package の例
# package.json
{
  "files": [
    "dist/",
    "LICENSE",
    "NOTICE",
    "README.md"
  ]
}

# Docker の例
# Dockerfile
FROM rust:latest
COPY LICENSE /app/LICENSE
COPY NOTICE /app/NOTICE
COPY . /app
...
```

---

### 5. 追加ライセンス条項 (第4条 後半)

**要件**:
> You may add Your own copyright statement to Your modifications and may provide additional or different license terms

**遵守方法**:

```markdown
# FORK_LICENSE.md (追加ライセンス条項)

# License for Fork Modifications

## Original Work
- Copyright 2025 OpenAI
- Licensed under Apache License 2.0
- See LICENSE file

## Fork Modifications
- Copyright 2025 Shunsuke Hayashi
- Licensed under Apache License 2.0 (same as original)

## Miyabi Integration (codex-miyabi/)
- Source: https://github.com/ShunsukeHayashi/Autonomous-Operations
- License: MIT (see codex-miyabi/LICENSE)

**Note**: The original Codex CLI remains under Apache 2.0.
Additional components (Miyabi) may have different licenses.
```

**重要**:
- 追加ライセンスは**オリジナル部分に影響しない**
- オリジナル部分は常にApache 2.0

---

### 6. 商標の使用制限 (第6条)

**要件**:
> This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor

**遵守事項**:

#### ✅ 許可される使用
```markdown
# README.md
This is a fork of **Codex CLI** by OpenAI.
Original: https://github.com/openai/codex
```

#### ❌ 禁止される使用
```markdown
# NG例1: 公式を装う
❌ "Official OpenAI Codex Enhanced Edition"
❌ "Codex by OpenAI and Shunsuke Hayashi"

# NG例2: 製品名として商標使用
❌ プロジェクト名を "OpenAI Codex Plus" にする
❌ ドメイン名を "codex-openai.com" にする

# OK例: 起源の説明
✅ "Fork of Codex CLI (OpenAI)"
✅ "Based on OpenAI's Codex CLI"
✅ "Compatible with Codex CLI by OpenAI"
```

#### プロジェクト名の推奨
```markdown
# 推奨: 明確に区別できる名前
- "Codex-Miyabi" (フォーク名 + 追加機能名)
- "Codex Fork by @ShunsukeHayashi"
- "Autonomous Codex" (機能を表す名前)

# README.mdで明示
# Codex-Miyabi

A fork of [Codex CLI](https://github.com/openai/codex) by OpenAI,
integrated with the Miyabi autonomous agent framework.

**Note**: This is NOT an official OpenAI product.
```

---

## 🚫 禁止事項まとめ

### 絶対に禁止
1. ❌ **LICENSEファイルの削除・変更**
2. ❌ **著作権表示 "Copyright 2025 OpenAI" の削除**
3. ❌ **NOTICEファイルの削除**
4. ❌ **OpenAI商標の不正使用** (公式を装う、製品名に使用など)
5. ❌ **オリジナルコードをApache 2.0以外でライセンス**

### 推奨されない
1. ⚠️ オリジナルファイルの大幅な変更 (フォーク識別が困難になる)
2. ⚠️ 変更履歴の記録なし (追跡不可能)
3. ⚠️ ライセンス情報の分かりにくい配置

---

## ✅ 必須チェックリスト

### コード変更時
- [ ] 変更したファイルに変更日と変更者を記載
- [ ] コミットメッセージに変更内容を明記
- [ ] オリジナルの著作権表示を保持

### 新規ファイル追加時 (Miyabi統合など)
- [ ] ファイル先頭にライセンス情報を記載
- [ ] NOTICEファイルに追記 (該当する場合)
- [ ] README.mdに追加コンポーネントの説明

### 配布・公開時
- [ ] LICENSEファイルを含める
- [ ] NOTICEファイルを含める
- [ ] README.mdにフォークである旨を明記
- [ ] オリジナルへのリンクを記載
- [ ] 商標使用ガイドラインを遵守

### GitHub公開時
- [ ] リポジトリ説明に "Fork of openai/codex" を記載
- [ ] AboutセクションにオリジナルのURLをリンク
- [ ] README.mdに明確な帰属表示
- [ ] Topicsに "fork" を追加

---

## 📝 推奨するREADME構成

```markdown
# Codex-Miyabi

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Fork](https://img.shields.io/badge/Fork-openai%2Fcodex-green.svg)](https://github.com/openai/codex)

## ⚠️ Important Notice

This is a **fork** of [Codex CLI](https://github.com/openai/codex) by OpenAI.

- **Original Work**: Copyright 2025 OpenAI
- **Original License**: Apache License 2.0
- **Fork Maintainer**: Shunsuke Hayashi
- **Fork Purpose**: Integration with Miyabi autonomous agent framework

**This is NOT an official OpenAI product.**

For the official Codex CLI, please visit: https://github.com/openai/codex

## About This Fork

This fork integrates the Miyabi autonomous agent framework...

[詳細]

## License

- **Original Codex CLI**: Apache License 2.0 (see [LICENSE](LICENSE))
- **Miyabi Integration**: MIT License (see [codex-miyabi/LICENSE](codex-miyabi/LICENSE))
- **Attribution**: See [NOTICE](NOTICE)

All modifications to the original Codex CLI code are licensed under Apache License 2.0.

## Credits

- **Codex CLI**: [OpenAI](https://github.com/openai/codex)
- **Miyabi Framework**: [Autonomous-Operations](https://github.com/ShunsukeHayashi/Autonomous-Operations)
```

---

## 🔄 上流(Upstream)との同期

### 定期的な同期推奨
```bash
# Upstreamから最新を取得
git fetch upstream

# 変更を確認
git log HEAD..upstream/main --oneline

# マージ (コンフリクトに注意)
git merge upstream/main

# 自分の変更を保持しつつマージ
git rebase upstream/main

# コンフリクト解決後
git push origin main
```

### 同期時の注意
- OpenAIの変更が自分の変更と競合する可能性
- ライセンス・NOTICEファイルの変更を注視
- 上流の新機能と自分の追加機能の整合性確認

---

## 🤝 OpenAIへのコントリビューション

### CLA (Contributor License Agreement) 必須

Upstreamへのコントリビューション時:

```bash
# 1. PRを作成
gh pr create --repo openai/codex --title "..."

# 2. PRコメントでCLA署名
# コメントに以下を投稿:
I have read the CLA Document and I hereby sign the CLA

# 3. CLA-Assistant botが確認
```

### コントリビューションポリシー

**重要**: OpenAIは新機能の外部コントリビューションを制限しています。

```markdown
# docs/contributing.md より引用
"At the moment, we only plan to prioritize reviewing external contributions
for bugs or security fixes."

"If you want to add a new feature or change the behavior of an existing one,
please open an issue proposing the feature and get approval from an OpenAI
team member before spending time building it."
```

**Miyabi統合について**:
- ❌ Miyabi統合をUpstreamにコントリビュートすることは**困難**
  - 新機能追加であり、事前承認が必要
  - OpenAIの roadmap と一致しない可能性が高い
- ✅ フォークとして独立して開発することが**適切**

---

## 🔐 セキュリティ脆弱性の報告

### Upstreamに影響する脆弱性を発見した場合

```bash
# OpenAIに報告 (docs/contributing.md より)
# Email: security@openai.com

# 報告内容:
# - 脆弱性の詳細
# - 再現手順
# - 影響範囲
# - 修正案 (あれば)
```

### フォーク固有の脆弱性

```bash
# 自分のリポジトリで対応
# Security Advisoryを作成
gh api repos/ShunsukeHayashi/codex/security-advisories \
  -X POST \
  -f summary="..." \
  -f description="..."
```

---

## 📦 配布時のライセンス表記例

### npm package (package.json)

```json
{
  "name": "@shunsuke/codex-miyabi",
  "version": "0.1.0",
  "description": "Fork of Codex CLI with Miyabi integration",
  "license": "Apache-2.0",
  "author": "Shunsuke Hayashi",
  "contributors": [
    "OpenAI (original work)"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/ShunsukeHayashi/codex.git"
  },
  "files": [
    "dist/",
    "LICENSE",
    "NOTICE",
    "README.md"
  ]
}
```

### Docker Image

```dockerfile
FROM rust:latest as builder

# ライセンスファイルをコピー
COPY LICENSE /app/LICENSE
COPY NOTICE /app/NOTICE
COPY README.md /app/README.md

# ビルド...

FROM debian:bookworm-slim
COPY --from=builder /app/LICENSE /LICENSE
COPY --from=builder /app/NOTICE /NOTICE
COPY --from=builder /app/target/release/codex /usr/local/bin/codex

# ライセンス情報をラベルに記載
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/ShunsukeHayashi/codex"
LABEL org.opencontainers.image.description="Fork of OpenAI Codex CLI with Miyabi integration"
```

### バイナリ配布 (GitHub Releases)

```markdown
# Release Notes

## Codex-Miyabi v0.1.0

### Important

This is a **fork** of [Codex CLI](https://github.com/openai/codex) by OpenAI.

- Original: Apache License 2.0, Copyright 2025 OpenAI
- See LICENSE and NOTICE files in the archive

### Downloads

- [codex-miyabi-v0.1.0-linux-x64.tar.gz](...)
- [codex-miyabi-v0.1.0-macos-arm64.tar.gz](...)

**Each archive includes**:
- `LICENSE` - Apache License 2.0
- `NOTICE` - Attribution notices
- `README.md` - Documentation
```

---

## ⚖️ ライセンス違反時のリスク

### 潜在的なリスク
1. **著作権侵害訴訟**: OpenAIから法的措置を受ける可能性
2. **GitHub DMCA通知**: リポジトリの削除
3. **npm/Homebrewからの削除**: パッケージ配布停止
4. **コミュニティからの信頼喪失**: オープンソースコミュニティでの評判悪化

### 回避方法
- ✅ このガイドに従う
- ✅ 不明点はOpenAIに問い合わせ
- ✅ 定期的なライセンス監査
- ✅ チーム全員への周知

---

## 📞 問い合わせ先

### ライセンス関連
- **Email**: legal@openai.com (推定)
- **GitHub Discussions**: https://github.com/openai/codex/discussions

### セキュリティ関連
- **Email**: security@openai.com

### 一般的な質問
- **GitHub Issues**: https://github.com/openai/codex/issues

---

## 🔄 このガイドの更新

このガイドは以下の場合に更新が必要:

- [ ] OpenAIがライセンスを変更した場合
- [ ] Apache Software Foundationがライセンスを更新した場合
- [ ] 新しい配布方法を追加した場合
- [ ] 法的アドバイスを受けた場合

**最終更新**: 2025-10-10
**次回レビュー**: 2025-11-10 (1ヶ月後)

---

## ✅ 最終チェックリスト

プロジェクト公開前に必ず確認:

### ファイル確認
- [ ] LICENSE ファイルが存在し、改変されていない
- [ ] NOTICE ファイルが存在し、フォーク情報を追記
- [ ] README.md にフォークである旨と帰属表示
- [ ] CONTRIBUTORS.md に変更履歴

### コード確認
- [ ] オリジナルの著作権表示が全ファイルに保持
- [ ] 変更したファイルに変更者・変更日を記載
- [ ] 新規ファイルにライセンスヘッダー

### 配布物確認
- [ ] npm package に LICENSE, NOTICE含む
- [ ] Docker image にライセンス情報
- [ ] バイナリ配布時にREADME含む

### 商標確認
- [ ] プロジェクト名がOpenAI商標を侵害していない
- [ ] README.mdで公式製品でないことを明示
- [ ] ドメイン名・SNSアカウント名が適切

### 法的確認
- [ ] 弁護士レビュー (大規模プロジェクトの場合)
- [ ] OpenAIからの事前承認 (必要に応じて)

---

**このガイドは法的助言ではありません。正式な法的助言が必要な場合は、弁護士に相談してください。**

**作成者**: Claude (Anthropic)
**レビュー**: 要Human確認
**承認**: 要Legal確認
