# 生产部署指南（云服务器 + Docker）

本指南面向"家里的正式使用"：部署到一台云服务器（或家用常开的主机），数据存在 MySQL 卷里持久可靠。

## 架构

```
访问者 ──HTTP 80──▶ nginx(frontend) ──/api──▶ Spring Boot(backend) ──▶ MySQL 8(mysql)
```

- 三个容器由 docker-compose 编排：`mysql`（数据卷持久化）、`backend`（Flyway 启动自动建表）、`frontend`（nginx 托管前端 + API 反代）
- 前后端同源：前端容器把 `/api` 反向代理到后端，无跨域问题

## 部署步骤（在一台装好 Docker 的服务器上）

```bash
# 1. 克隆代码（或 scp 整个目录上去）
git clone git@github.com:et365/Trace-Learning-Assistant.git
cd Trace-Learning-Assistant

# 2. 构建并启动（首次约 5~10 分钟：Maven/npm 在容器内下载依赖）
docker compose up -d --build

# 3. 查看状态与日志
docker compose ps
docker compose logs -f backend    # 看到 Started StudyHelperApplication 即成功

# 4. 访问
# 应用:   http://服务器IP/
# 接口文档: http://服务器IP:8080/swagger-ui.html（建议生产环境关闭 8080 对外暴露）
```

首次启动 Flyway 自动执行 V1~V14 迁移建表并写入种子数据（演示课表/试卷）。正式使用前可在应用内把演示数据替换为真实内容，或删除种子错题。

## 更新版本

```bash
git pull
docker compose up -d --build     # 自动重建变更的容器，MySQL 数据保留在卷里
```

## 上线前必须做的事

1. **改数据库密码**：`docker-compose.yml` 中 `MYSQL_PASSWORD`、`SPRING_DATASOURCE_PASSWORD`（两处需一致）
2. **关闭后端对外端口**：删除 backend 的 `ports: 8080:8080`（API 只经 nginx 反代访问）
3. **HTTPS**：套一层 nginx/Caddy 或云厂商负载均衡挂证书；应用本身是 HTTP
4. **数据备份**：`docker compose exec mysql mysqldump -uroot -proot123 study_helper > backup.sql`，建议 cron 每日一次
5. **儿童数据合规**：对外提供服务前按设计文档第 6 章落实（家长实名、数据最小化、照片脱敏提示）

## 本机开发与生产的区别

| | 本机开发（P1） | 生产部署 |
|---|---|---|
| 启动 | mvn + npm dev 两个进程 | `docker compose up -d --build` 一条命令 |
| MySQL | 本机 brew 安装的 8.4 | 容器化 8.0（数据卷） |
| 前端 | Vite dev server（5173，代理 /api） | nginx 托管构建产物（80，反代 /api） |
| CORS | WebConfig 放行 5173 | 同源，无需 CORS |
