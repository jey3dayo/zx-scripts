# Deno Scripts

様々なシステム更新タスクを実行するためのDenoスクリプト集です。

## 前提条件

```bash
# Denoのインストール
curl -fsSL https://deno.land/install.sh | sh
```

## 利用可能なスクリプト

### update_package.ts

システム全体のパッケージ更新を並行実行します：

- Node.js グローバルパッケージ
- Python パッケージ (pip, pipx)
- Homebrew パッケージ (macOS)
- APT パッケージ (Linux)
- Neovim プラグイン
- Gitリポジトリの更新
- mise 環境管理ツール

## 実行方法

### タスクコマンド経由

```bash
deno task update-package
```

### 直接実行

```bash
./scripts/update_package.ts
```

### 必要な権限

スクリプトは以下の権限で実行されます：
- `--allow-run`: 外部コマンド実行
- `--allow-env`: 環境変数アクセス  
- `--allow-read`: ファイル読み取り

## 開発

### フォーマット

```bash
deno fmt scripts/
```

### リント

```bash
deno lint scripts/
```
