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
    自动化接口功能测试报告.docx
    自动化接口性能测试报告.docx
    校园版自动化接口测试汇报摘要.docx
  report_inputs/
    report_meta.sample.json
    defects.sample.csv
    README_report_inputs.md
  scripts/
    generate_formal_reports.py
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

### 2.3 性能（学生答题重点，随机 subtitleAnswerList）

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

- `base.protocol/base.host/base.port/base.path`：测试环境基础地址（当前默认 `http://192.168.0.90/api`）。
- `courseId/teachingTaskId/blockId`：固定业务参数。
- `auth.prefix`：鉴权前缀，默认 `Bearer `。
- `clientKey/clientVersion`：客户端头。
- `functional.* / keepalive.* / perf.*`：线程数、时长、心跳间隔等压测参数。
- `answer.payload.mode`：`dynamic`/`fallback`/`hybrid`，默认 `hybrid`。
- `answer.min/answer.max`：随机合法数值范围（当前 `1-9999`）。

## 4. 如何维护账号

- 文件：`jmeter/data/accounts.csv`
- 字段：`username,password,mac`
- 当前规则：登录请求中的 `mac` 在每次调用前由脚本动态生成 11 位随机整数；`accounts.csv` 中 `mac` 字段仅保留为兼容/兜底列（不再作为固定登录值）
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

## 8. 正式汇报报告输出（严格数据驱动）

说明：以下输入全部必填，任一缺失会直接报错，不会生成“无数据报告”。

```bash
python3 jmeter/scripts/generate_formal_reports.py \
  --functional-jtl jmeter/results_functional.jtl \
  --performance-jtl jmeter/results_performance.jtl \
  --defects jmeter/report_inputs/defects.sample.csv \
  --meta jmeter/report_inputs/report_meta.sample.json \
  --jmx jmeter/test-plan.jmx \
  --output-dir jmeter/docs
```

输出 3 份独立 `.docx`：
- `自动化接口功能测试报告.docx`
- `自动化接口性能测试报告.docx`
- `校园版自动化接口测试汇报摘要.docx`

## 9. 已知风险与注意事项

- 若响应出现 `NullPointerException`、`Cannot invoke` 等异常类名，视为缺陷线索。
- `saveQuestionAnswer` 使用 `questionAnswerList.subtitleAnswerList` 随机合法数值（`1-9999`），并增加“与上一次提交不重复”保护，用于稳定触发重新判分流程。
- 当前报告口径固定使用 3 个 `subtitleId`：`ribcrlV6xK`、`Uv9NC4virf`、`lHBYTCtXty`。
- 如后端字段规则变更，请优先调整 `PreProcessor` 动态组包逻辑，再调整 fallback 模板。
- 当前 `saveQuestionAnswer/saveExpAnswerRecord` 采用“最小可执行报文 + 可扩展字段”策略：
  - 已实现必需字段与 `subtitleAnswerList` 随机机制。
  - 如后端新增强校验字段，请在对应请求体中补充 `TODO` 业务字段（保留现有结构不变）。
