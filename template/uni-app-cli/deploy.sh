#!/bin/bash

# CRMEB uni-app H5 自动化部署脚本

set -e

echo "🚀 开始编译 uni-app H5..."
npm run build:h5

echo "📦 清理旧的部署文件..."
rm -rf ../../crmeb/public/home/*

echo "📋 复制编译产物..."
cp -r dist/build/h5/* ../../crmeb/public/home/

echo "🔄 清理 Redis 缓存..."
docker exec crmeb_redis redis-cli -a '123456' FLUSHALL 2>/dev/null || echo "跳过 Redis 缓存清理（容器未运行）"

echo "✅ 部署完成！"
echo "访问: http://localhost:8011/home/"
