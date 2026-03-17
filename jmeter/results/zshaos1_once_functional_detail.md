# zshaos1 单次功能链路 + 心跳保活执行明细

## 1) 执行参数
- 账号: `zshaos1`
- baseUrl: `http://192.168.0.90/api`
- 场景: 登录后启动心跳（每10秒），主功能接口各调用1次
- userReportId(映射): `2033505644322402307`

## 2) 结果汇总
- 总调用数: **11**
- 成功: **11**
- 失败: **0**
- 成功率: **100.00%**
- 心跳调用次数: **1**

## 3) 调用清单（按时序）
| # | 时间 | Label | Method | Status | 耗时(ms) |
|---|---|---|---|---:|---:|
| 1 | 2026-03-17 19:05:10.671 | `FUNC-Login` | POST | 200 | 320 |
| 2 | 2026-03-17 19:05:10.991 | `KA-Heartbeat` | POST | 200 | 63 |
| 3 | 2026-03-17 19:05:10.992 | `FUNC-QueryCourseList` | GET | 200 | 88 |
| 4 | 2026-03-17 19:05:11.080 | `FUNC-GetCourseChapterTaskList` | GET | 200 | 86 |
| 5 | 2026-03-17 19:05:11.167 | `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 57 |
| 6 | 2026-03-17 19:05:11.224 | `FUNC-QueryExpGuidebookContent` | GET | 200 | 64 |
| 7 | 2026-03-17 19:05:11.289 | `FUNC-saveQuestionAnswer` | POST | 200 | 140 |
| 8 | 2026-03-17 19:05:11.430 | `FUNC-SaveExpAnswerRecord` | POST | 200 | 36 |
| 9 | 2026-03-17 19:05:11.466 | `FUNC-QuitTeachingTask` | GET | 200 | 32 |
| 10 | 2026-03-17 19:05:11.499 | `FUNC-QuitCourse` | GET | 200 | 31 |
| 11 | 2026-03-17 19:05:16.536 | `FUNC-Logout` | POST | 200 | 40 |

## 4) 401 / 失败详单（含请求与返回）
- 无失败/401。
