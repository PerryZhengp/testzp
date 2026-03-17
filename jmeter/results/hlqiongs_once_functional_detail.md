# hlqiongs 单次功能链路 + 心跳保活执行明细

## 1) 执行参数
- 账号: `hlqiongs`
- baseUrl: `http://192.168.0.90/api`
- 场景: 登录后启动心跳（每10秒），主功能接口各调用1次
- userReportId(映射): `2033505644318208000`

## 2) 结果汇总
- 总调用数: **11**
- 成功: **11**
- 失败: **0**
- 成功率: **100.00%**
- 心跳调用次数: **1**

## 3) 调用清单（按时序）
| # | 时间 | Label | Method | Status | 耗时(ms) |
|---|---|---|---|---:|---:|
| 1 | 2026-03-17 19:04:57.928 | `FUNC-Login` | POST | 200 | 379 |
| 2 | 2026-03-17 19:04:58.308 | `KA-Heartbeat` | POST | 200 | 77 |
| 3 | 2026-03-17 19:04:58.308 | `FUNC-QueryCourseList` | GET | 200 | 89 |
| 4 | 2026-03-17 19:04:58.398 | `FUNC-GetCourseChapterTaskList` | GET | 200 | 84 |
| 5 | 2026-03-17 19:04:58.482 | `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 57 |
| 6 | 2026-03-17 19:04:58.540 | `FUNC-QueryExpGuidebookContent` | GET | 200 | 62 |
| 7 | 2026-03-17 19:04:58.602 | `FUNC-saveQuestionAnswer` | POST | 200 | 147 |
| 8 | 2026-03-17 19:04:58.750 | `FUNC-SaveExpAnswerRecord` | POST | 200 | 34 |
| 9 | 2026-03-17 19:04:58.784 | `FUNC-QuitTeachingTask` | GET | 200 | 31 |
| 10 | 2026-03-17 19:04:58.816 | `FUNC-QuitCourse` | GET | 200 | 27 |
| 11 | 2026-03-17 19:05:03.849 | `FUNC-Logout` | POST | 200 | 45 |

## 4) 401 / 失败详单（含请求与返回）
- 无失败/401。
