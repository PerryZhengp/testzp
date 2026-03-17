# 校园版接口测试工程说明

## 1. 工程结构

```text
jmeter/
  test-plan.jmx
  env.properties
  data/
    accounts.csv
    account_report_mapping.csv
  assertions/
    README_assertions.md
  docs/
    README.md
    testcase_summary.md
    campus_function_report.docx
  scripts/
    generate_function_report.py
```

## 2. 运行方式

### 2.1 功能/边界/异常

```bash
jmeter -n \
  -t jmeter/test-plan.jmx \
  -q jmeter/env.properties \
  -Jrun.profile=functional \
  -l jmeter/results_functional.jtl \
  -e -o jmeter/report_functional
```

### 2.2 性能（登录重点）

```bash
jmeter -n \
  -t jmeter/test-plan.jmx \
  -q jmeter/env.properties \
  -Jrun.profile=perf_login \
  -l jmeter/results_perf_login.jtl \
  -e -o jmeter/report_perf_login
```

### 2.3 性能（学生答题重点，随机 subtitleanswer）

```bash
jmeter -n \
  -t jmeter/test-plan.jmx \
  -q jmeter/env.properties \
  -Jrun.profile=perf_answer \
  -l jmeter/results_perf_answer.jtl \
  -e -o jmeter/report_perf_answer
```

### 2.4 性能（4账号持续在线场景）

```bash
jmeter -n \
  -t jmeter/test-plan.jmx \
  -q jmeter/env.properties \
  -Jrun.profile=perf_mixed \
  -l jmeter/results_perf_mixed.jtl \
  -e -o jmeter/report_perf_mixed
```

## 3. 参数说明

- `base.protocol/base.host/base.port`：测试环境基础地址。
- `courseId/teachingTaskId/blockId`：固定业务参数。
- `auth.prefix`：鉴权前缀，默认 `Bearer `。
- `clientKey/clientVersion`：客户端头。
- `functional.* / keepalive.* / perf.*`：线程数、时长、心跳间隔等压测参数。
- `answer.payload.mode`：`dynamic`/`fallback`/`hybrid`，默认 `hybrid`。
- `answer.min/answer.max`：随机合法数值范围。

## 4. 如何维护账号

- 文件：`jmeter/data/accounts.csv`
- 字段：`username,password,mac`
- 当前规则：同一密码，`mac` 按基准号递增（每账号 +1）
- 新增账号时只需要新增一行，不需要改 JMX 结构。

## 5. 如何维护 userReportId 映射

- 文件：`jmeter/data/account_report_mapping.csv`
- 字段：`username,userReportId`
- 正向场景优先动态提取（章节任务接口），CSV 作为回退。
- 如映射为空，会自动跳过依赖接口并记录 `PRECONDITION_MISSING`。

## 6. 正向测试接口范围

- `POST /admin/nexalapi/base/v1/login`
- `POST /admin/nexalapi/base/v1/heartbeat`
- `POST /admin/nexalapi/base/v1/logout`
- `GET /admin/nexalapi/resource/v1/queryCourseList`
- `GET /admin/nexalapi/resource/v1/getCourseChapterTaskList`
- `GET /admin/nexalapi/resource/v1/queryExpGuidebookCatalog`
- `GET /admin/nexalapi/resource/v1/queryExpGuidebookContent`
- `POST /admin/nexalapi/exp/v1/saveQuestionAnswer`
- `POST /admin/camClientExpAnswerRecord/saveExpAnswerRecord`
- `GET /admin/nexalapi/exp/v1/quitTeachingTask`
- `GET /admin/nexalapi/exp/v1/quitCourse`

## 7. 异常测试范围

- 不带 Authorization、空 token、伪造 token、过期 token、登出后复用 token
- `courseId` 为空/非法、`teachingTaskId` 为空/非法、`userReportId` 为空、`blockId` 为空
- Header 缺失
- `clientKey/clientkey` 大小写兼容
- `clientVersion/clientversion` 大小写兼容
- `clientVersion` 值兼容：`V1.0`、`v1.0`、`1.0.0`
- 跨账号 `userReportId` 越权访问（独立异常链路）

## 8. 正式汇报报告输出

功能执行后，运行：

```bash
python3 jmeter/scripts/generate_function_report.py \
  --input-jtl jmeter/results_functional.jtl \
  --output-docx jmeter/docs/campus_function_report.docx
```

报告为“结论先行 + 风险闭环”结构，适合领导汇报。

## 9. 已知风险与注意事项

- 若响应出现 `NullPointerException`、`Cannot invoke` 等异常类名，视为缺陷线索。
- `saveQuestionAnswer` 使用随机合法数值 `subtitleanswer`，每人每次不同，用于触发重新判分流程。
- 如后端字段规则变更，请优先调整 `PreProcessor` 动态组包逻辑，再调整 fallback 模板。
- 当前 `saveQuestionAnswer/saveExpAnswerRecord` 采用“最小可执行报文 + 可扩展字段”策略：
  - 已实现必需字段与 `subtitleanswer` 随机机制。
  - 如后端新增强校验字段，请在对应请求体中补充 `TODO` 业务字段（保留现有结构不变）。
