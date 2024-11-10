#!/bin/bash

# 运行 changeset version 更新版本
pnpm changeset version

# 获取 package.json 中的版本号
VERSION=$(node -p "require('./package.json').version")

# 提交变更
git add .
git commit -m "release: v${VERSION}"

# 创建标签
git tag "v${VERSION}"

# 推送代码和标签到远程仓库
git push origin main
git push origin "v${VERSION}"

echo "✨ Released version v${VERSION}"
