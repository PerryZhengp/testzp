# zhengpengst 单次功能链路 + 心跳保活执行明细

## 1) 执行参数
- 账号: `zhengpengst`
- baseUrl: `http://192.168.0.90/api`
- 场景: 登录后启动心跳（每10秒），主功能接口各调用1次
- userReportId(映射): `2033505644322402315`

## 2) 结果汇总
- 总调用数: **11**
- 成功: **11**
- 失败: **0**
- 成功率: **100.00%**
- 心跳调用次数: **1**

## 3) 调用清单（按时序）
| # | 时间 | Label | Method | Status | 耗时(ms) |
|---|---|---|---|---:|---:|
| 1 | 2026-03-17 19:04:45.639 | `FUNC-Login` | POST | 200 | 322 |
| 2 | 2026-03-17 19:04:45.962 | `KA-Heartbeat` | POST | 200 | 59 |
| 3 | 2026-03-17 19:04:45.962 | `FUNC-QueryCourseList` | GET | 200 | 87 |
| 4 | 2026-03-17 19:04:46.049 | `FUNC-GetCourseChapterTaskList` | GET | 200 | 82 |
| 5 | 2026-03-17 19:04:46.132 | `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 51 |
| 6 | 2026-03-17 19:04:46.184 | `FUNC-QueryExpGuidebookContent` | GET | 200 | 61 |
| 7 | 2026-03-17 19:04:46.246 | `FUNC-saveQuestionAnswer` | POST | 200 | 151 |
| 8 | 2026-03-17 19:04:46.397 | `FUNC-SaveExpAnswerRecord` | POST | 200 | 33 |
| 9 | 2026-03-17 19:04:46.431 | `FUNC-QuitTeachingTask` | GET | 200 | 41 |
| 10 | 2026-03-17 19:04:46.473 | `FUNC-QuitCourse` | GET | 200 | 28 |
| 11 | 2026-03-17 19:04:51.507 | `FUNC-Logout` | POST | 200 | 53 |

## 4) 401 / 失败详单（含请求与返回）
- 无失败/401。
