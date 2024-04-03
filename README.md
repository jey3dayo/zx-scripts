# 使い方

## package.jsonに使いたいコマンドを記載

```
  "bin": {
    "pr-agent": "./scripts/pr-agent.mjs",
    "update-pkg": "./scripts/update-pkg.mjs"
  },
```

## インストール

```
brew install zx
```

```
npm install -g .
```

## 実行方法

```
% which pr-agent
/Users/t00114/.mise/installs/node/20/bin/pr-agent
```

### pr-agnet

事前に各トークンを設定

```
export OPENAI_API_KEY=XXXXXXXXXX
export GITHUB_TOKEN=XXXXXXXXXX
```

```
% pr-agent
Usage: <PR_URL> [ACTION]
```
