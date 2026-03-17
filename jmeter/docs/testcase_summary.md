# 校园版接口测试用例摘要

## 一、功能测试（主链路）

1. 登录成功提取 `accessToken`、`refreshToken`
2. 查询课程列表
3. 查询课程章节任务并提取当前账号 `userReportId`
4. 查询指导书目录
5. 查询指导书内容（使用账号匹配的 `userReportId`）
6. 学生答题（`questionAnswerList.subtitleAnswerList` 合法随机）
7. 保存答题过程
8. 退出教学任务
9. 退出课程
10. 登出

预期：
- HTTP 成功
- 业务 `code=0`
- 关键字段存在

## 二、边界值与异常

1. 缺失 Authorization
2. 空 token
3. 伪造 token
4. 过期 token
5. 登出后复用 token
6. `courseId` 为空
7. `courseId` 非法
8. `teachingTaskId` 为空
9. `teachingTaskId` 非法
10. `userReportId` 为空
11. `blockId` 为空
12. Header 缺失
13. `clientKey/clientkey` 兼容
14. `clientVersion/clientversion` 兼容
15. `clientVersion=V1.0/v1.0/1.0.0` 兼容
16. 跨账号 `userReportId` 越权访问

预期：
- 允许明确业务失败
- 不允许服务端 500 作为通过
- 命中异常类名文本时记录缺陷线索

## 三、会话保活

1. 登录后每 10 秒 heartbeat
2. 连续保活验证会话有效
3. 停止 heartbeat，等待 token 过期后调用受保护接口
4. 过期后再次 heartbeat 验证不能恢复会话

## 四、性能测试

### 4.1 登录重点
- 持续压测 `login`，采集吞吐、错误率、P95、P99

### 4.2 学生答题重点
- 持续压测 `saveQuestionAnswer`（填空题）
- 每次随机生成合法数值 `subtitleAnswerList.subtitleAnswer`（`1-9999`），并避免与上一次提交重复
- 当前报告口径固定使用 3 个 `subtitleId`：`ribcrlV6xK`、`Uv9NC4virf`、`lHBYTCtXty`

### 4.3 4账号持续在线
- 登录 + 每 10 秒 heartbeat + 查询 + 答题 + 保存过程循环
- 验证长时间稳定性
