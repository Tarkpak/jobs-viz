# 部署指南

## PM2 部署配置

本项目已配置 PM2 进程管理器，应用将运行在 **5551 端口**。

## 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 bun
bun install
```

### 2. 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 bun
bun run build
```

### 3. 启动应用

```bash
# 使用 PM2 启动
npm run pm2:start

# 或使用 bun
bun run pm2:start
```

应用将在 `http://localhost:5551` 运行。

## PM2 管理命令

### 启动应用
```bash
npm run pm2:start
```

### 停止应用
```bash
npm run pm2:stop
```

### 重启应用
```bash
npm run pm2:restart
```

### 删除应用
```bash
npm run pm2:delete
```

### 查看日志
```bash
npm run pm2:logs
```

### 监控应用
```bash
npm run pm2:monit
```

### 查看应用状态
```bash
pm2 status
```

### 查看详细信息
```bash
pm2 show jobs-viz
```

## PM2 配置说明

配置文件：`ecosystem.config.cjs`

```javascript
{
  name: 'jobs-viz',              // 应用名称
  script: './.output/server/index.mjs',  // 启动脚本
  instances: 1,                  // 实例数量
  exec_mode: 'cluster',          // 集群模式
  env: {
    NODE_ENV: 'production',      // 生产环境
    PORT: 5551,                  // 端口号
    HOST: '0.0.0.0'             // 监听所有网络接口
  },
  error_file: './logs/err.log',  // 错误日志
  out_file: './logs/out.log',    // 输出日志
  log_file: './logs/combined.log', // 合并日志
  time: true,                    // 日志时间戳
  autorestart: true,             // 自动重启
  max_restarts: 10,              // 最大重启次数
  min_uptime: '10s',             // 最小运行时间
  max_memory_restart: '500M',    // 内存限制
  watch: false                   // 不监听文件变化
}
```

## 修改端口

如需修改端口，编辑 `ecosystem.config.cjs` 文件：

```javascript
env: {
  PORT: 5551,  // 修改为你想要的端口
  HOST: '0.0.0.0'
}
```

然后重启应用：
```bash
npm run pm2:restart
```

## 日志管理

### 日志位置
- 错误日志: `./logs/err.log`
- 输出日志: `./logs/out.log`
- 合并日志: `./logs/combined.log`

### 查看实时日志
```bash
npm run pm2:logs
```

### 清空日志
```bash
pm2 flush jobs-viz
```

### 日志轮转
PM2 支持日志轮转，安装 pm2-logrotate 模块：

```bash
pm2 install pm2-logrotate
```

配置日志轮转：
```bash
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 开机自启动

### 生成启动脚本
```bash
pm2 startup
```

按照提示执行命令（需要 sudo 权限）。

### 保存当前进程列表
```bash
pm2 save
```

### 取消开机自启动
```bash
pm2 unstartup
```

## 多实例部署（集群模式）

如需运行多个实例以提高性能，修改 `ecosystem.config.cjs`：

```javascript
{
  instances: 'max',  // 使用所有 CPU 核心
  // 或指定数量
  instances: 4,      // 运行 4 个实例
}
```

## 环境变量

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run pm2:start
```

### 自定义环境变量

在 `ecosystem.config.cjs` 中添加：

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5551,
  HOST: '0.0.0.0',
  // 添加自定义环境变量
  DATABASE_URL: 'your-database-url',
  API_KEY: 'your-api-key'
}
```

## Nginx 反向代理配置

如果使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5551;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 监控和性能

### 实时监控
```bash
npm run pm2:monit
```

### Web 监控界面
安装 PM2 Plus（可选）：
```bash
pm2 link [secret-key] [public-key]
```

### 性能指标
```bash
pm2 describe jobs-viz
```

## 故障排查

### 应用无法启动
1. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :5551
   ```

2. 查看错误日志：
   ```bash
   npm run pm2:logs
   ```

3. 检查构建是否成功：
   ```bash
   ls -la .output/server/index.mjs
   ```

### 应用频繁重启
1. 查看日志找出原因
2. 检查内存使用情况
3. 增加 `max_memory_restart` 限制

### 端口冲突
修改 `ecosystem.config.cjs` 中的 PORT 配置。

## 更新部署

### 标准更新流程
```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 重启应用
npm run pm2:restart
```

### 零停机更新
```bash
pm2 reload jobs-viz
```

## 备份和恢复

### 备份进程列表
```bash
pm2 save
```

### 恢复进程列表
```bash
pm2 resurrect
```

## 安全建议

1. **使用环境变量**: 敏感信息不要硬编码
2. **限制内存**: 设置 `max_memory_restart`
3. **日志轮转**: 防止日志文件过大
4. **监控告警**: 配置 PM2 Plus 或其他监控工具
5. **定期更新**: 保持依赖包最新

## 生产环境检查清单

- [ ] 已构建生产版本
- [ ] PM2 配置正确
- [ ] 端口配置正确（5551）
- [ ] 日志目录存在且可写
- [ ] 环境变量配置完整
- [ ] 开机自启动已配置
- [ ] Nginx 反向代理已配置（如需要）
- [ ] 防火墙规则已设置
- [ ] 监控和告警已配置
- [ ] 备份策略已制定

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `npm run pm2:start` | 启动应用 |
| `npm run pm2:stop` | 停止应用 |
| `npm run pm2:restart` | 重启应用 |
| `npm run pm2:delete` | 删除应用 |
| `npm run pm2:logs` | 查看日志 |
| `npm run pm2:monit` | 监控应用 |
| `pm2 status` | 查看状态 |
| `pm2 list` | 列出所有应用 |
| `pm2 save` | 保存进程列表 |
| `pm2 resurrect` | 恢复进程列表 |

## 技术支持

如遇到问题，请查看：
1. PM2 官方文档: https://pm2.keymetrics.io/
2. Nuxt 部署文档: https://nuxt.com/docs/getting-started/deployment
3. 项目日志文件: `./logs/`

---

**端口信息**: 应用运行在 `http://localhost:5551`
