# 学习小管家（P1 本机全栈版）

以课程表为数据源的小学生学习进度跟踪应用：每日任务打卡（课堂作业/家庭加练/任务）、今日所学、试卷档案与成绩趋势、薄弱科目分析、错题本、本周所学与周报概览。

技术栈：Vite + React + TypeScript（前端）｜ Spring Boot 3 + JPA + Flyway（后端）｜ MySQL 8

## 工程结构

```
study-helper/
├─ docker-compose.yml          # MySQL 8（数据卷持久化）
├─ backend/                    # Spring Boot 3（Maven 单模块，按功能分包）
│  └─ src/main/resources/db/migration/   # Flyway 版本化建表与种子数据
└─ frontend/                   # Vite + React + TS
   └─ src/{api, domain, stores, platform, pages, components}
```

## 前置条件

| 工具 | 用途 | 安装（macOS / Homebrew） |
|---|---|---|
| Docker | 运行 MySQL | 已装即可 |
| JDK 17 | 运行后端 | `brew install --cask temurin@17` |
| Maven | 构建后端 | `brew install maven` |
| Node 18+ | 前端开发 | 已装（v26 ✓） |

> 不想装 JDK/Maven？后端也提供了 Dockerfile，可用 Docker 构建运行（见下"零安装方式"）。

## 启动（三步）

```bash
# 1. 启动 MySQL（首次会自动建库；数据存 docker 卷，重启不丢）
docker compose up -d

# 2. 启动后端（Flyway 自动建表 + 写入演示数据；接口文档见 /swagger-ui.html）
cd backend && mvn spring-boot:run

# 3. 启动前端（另开终端）
cd frontend && npm install && npm run dev
```

打开 http://localhost:5173 即可使用；接口文档 http://localhost:8080/swagger-ui.html

> 本机 3306 端口被占用？把 docker-compose.yml 的端口映射改为 `3307:3306`，并把 `backend/src/main/resources/application.yml` 的 JDBC URL 端口同步改为 3307。

## 零安装方式（全 Docker，可选）

```bash
docker compose up -d
docker build -t study-helper-backend ./backend
docker run --rm -p 8080:8080 --network host   -e SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/study_helper?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai"   study-helper-backend
```

## 已实现（V1 本机全栈版）

- 课程表网格 + 课程格编辑弹层（科目/学习内容/掌握度/疑问/作业任务），与「今日」共享同一份数据、双向同步
- 今日任务：按当天课表自动生成；作业三态自动汇总；逐项打勾（完成得星星）；疑问备注；今日所学
- 老师消息粘贴导入：规则引擎按序号拆分任务、"注意…部分同学"拆为选做项（后端 /api/ai/parse-homework）
- 试卷档案：录入成绩（科目/单元/类型/得分/失分原因）、单科趋势图（目标线 90）、薄弱科目识别（联动课表给建议）
- 错题本：按科目 × 学年学期筛选、掌握状态打卡
- 总结页：本周完成率/打卡/星星、本周所学清单（按天×科目）、掌握度、考试小结

## P1 边界（后续接入）

- 拍照识错题（OCR）：接口与按钮已预留，未接模型——先使用「录入成绩」
- 登录/多用户、云同步、消息推送：见产品设计文档第 7 章 P2/P3
