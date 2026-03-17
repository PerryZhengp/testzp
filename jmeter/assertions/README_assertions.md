# 断言与缺陷线索规则

## 通用断言
- HTTP 状态码必须是业务预期范围（成功场景一般为 200；异常场景允许 4xx/业务失败）。
- 响应 JSON 必须包含 `code`、`ok` 字段。
- 任意场景若出现服务端 `500`，不计为“通过”，统一记为缺陷线索。

## 关键接口断言
- 登录 `POST /admin/nexalapi/base/v1/login`
  - 断言 `code=0`
  - 断言 `data.accessToken` 非空
  - 断言 `data.refreshToken` 非空
- 登出 `POST /admin/nexalapi/base/v1/logout`
  - 断言 `code=0`
  - 断言 `data=true`
  - 断言 `ok=true`
- 保存答题过程 `POST /admin/camClientExpAnswerRecord/saveExpAnswerRecord`
  - 断言 `code=0`
  - 断言 `data=true`
  - 断言 `ok=true`
- 其他接口
  - 至少断言 HTTP 状态、`code` 字段存在、关键字段存在性

## 异常场景断言策略
- 允许“明确业务失败”作为通过（例如：`code!=0`、`ok=false`、HTTP 403/424 等）。
- 不允许把服务端 500 当成异常用例通过结果。

## 缺陷线索关键字
以下关键字命中即高优先级缺陷线索：
- `NullPointerException`
- `Cannot invoke`
- `java.lang`
- `Exception`
- `StackTrace`

## userReportId 相关规则
- 正向链路必须使用当前账号的 `userReportId`。
- 若 `userReportId` 缺失：跳过依赖接口并打标 `PRECONDITION_MISSING`。
- 跨账号 `userReportId` 必须放在异常线程组，并断言“不能越权成功”。
