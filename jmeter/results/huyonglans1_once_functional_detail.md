# huyonglans1 单次功能链路 + 心跳保活执行明细

## 1) 执行参数
- 账号: `huyonglans1`
- baseUrl: `http://192.168.0.90/api`
- 场景: 登录后启动心跳（每10秒），主功能接口各调用1次
- userReportId(映射): `2033505644322402311`

## 2) 结果汇总
- 总调用数: **11**
- 成功: **11**
- 失败: **0**
- 成功率: **100.00%**
- 心跳调用次数: **1**

## 3) 调用清单（按时序）
| # | 时间 | Label | Method | Status | 耗时(ms) |
|---|---|---|---|---:|---:|
| 1 | 2026-03-17 19:05:22.380 | `FUNC-Login` | POST | 200 | 401 |
| 2 | 2026-03-17 19:05:22.781 | `KA-Heartbeat` | POST | 200 | 41 |
| 3 | 2026-03-17 19:05:22.781 | `FUNC-QueryCourseList` | GET | 200 | 69 |
| 4 | 2026-03-17 19:05:22.851 | `FUNC-GetCourseChapterTaskList` | GET | 200 | 69 |
| 5 | 2026-03-17 19:05:22.921 | `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 46 |
| 6 | 2026-03-17 19:05:22.967 | `FUNC-QueryExpGuidebookContent` | GET | 200 | 55 |
| 7 | 2026-03-17 19:05:23.023 | `FUNC-saveQuestionAnswer` | POST | 200 | 127 |
| 8 | 2026-03-17 19:05:23.150 | `FUNC-SaveExpAnswerRecord` | POST | 200 | 32 |
| 9 | 2026-03-17 19:05:23.183 | `FUNC-QuitTeachingTask` | GET | 200 | 33 |
| 10 | 2026-03-17 19:05:23.216 | `FUNC-QuitCourse` | GET | 200 | 23 |
| 11 | 2026-03-17 19:05:28.245 | `FUNC-Logout` | POST | 200 | 49 |

## 4) 401 / 失败详单（含请求与返回）
- 无失败/401。
