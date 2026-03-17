# hlqiongs 单账号功能接口执行明细

## 1) 执行参数
- 账号: `hlqiongs`
- 计划文件: `jmeter/test-plan.jmx`
- 环境: `http://192.168.0.90/api`
- Profile: `functional`（功能链路 + 心跳线程，异常线程关闭）
- 结果JTL: `jmeter/results/hlqiongs_functional_detail.jtl`

## 2) 总体结果
- 样本总数: **20**
- 成功: **11**
- 失败: **9**
- 成功率: **55.00%**
- 总耗时窗口: **95.986s**

## 3) 分接口汇总
| Label | 结果 | 状态码分布 | 平均耗时(ms) | 失败信息 |
|---|---:|---|---:|---|
| `INIT - keepalive vars` | 1/1 | 200:1 | 49.0 |  |
| `INIT - Load Mapping & Runtime Vars` | 1/1 | 200:1 | 258.0 |  |
| `KA-Login` | 1/1 | 200:1 | 312.0 |  |
| `FUNC-Login` | 0/1 | 500:1 | 38.0 | Test failed: text expected to contain /"code":0/ (1) |
| `FUNC-QueryCourseList` | 0/1 | 401:1 | 12.0 | Test failed: text expected to contain /"code":0/ (1) |
| `FUNC-GetCourseChapterTaskList` | 0/1 | 401:1 | 28.0 | Test failed: text expected to contain /"code":0/ (1) |
| `MARK - PRECONDITION_MISSING userReportId` | 1/1 | 200:1 | 6.0 |  |
| `FUNC-QuitTeachingTask` | 0/1 | 401:1 | 20.0 | Test failed: text expected to contain /"code":0/ (1) |
| `FUNC-QuitCourse` | 0/1 | 401:1 | 26.0 | Test failed: text expected to contain /"code":0/ (1) |
| `FUNC-Logout` | 0/1 | 401:1 | 24.0 | Test failed: text expected to contain /"code":0/ (1) |
| `KA-Heartbeat` | 6/6 | 200:6 | 41.0 |  |
| `KA-QueryCourseList-Alive [EXPECT_OK]` | 1/1 | 200:1 | 55.0 |  |
| `KA-QueryCourseList-AfterExpire [EXPECT_FAIL]` | 0/1 | 200:1 | 53.0 | Expected failure but got success: KA-QueryCourseList-AfterExpire [EXPECT_FAIL] (1) |
| `KA-Heartbeat-AfterExpire [EXPECT_FAIL]` | 0/1 | 200:1 | 31.0 | Expected failure but got success: KA-Heartbeat-AfterExpire [EXPECT_FAIL] (1) |
| `KA-QueryCourseList-AfterExpiredHeartbeat [EXPECT_FAIL]` | 0/1 | 200:1 | 48.0 | Expected failure but got success: KA-QueryCourseList-AfterExpiredHeartbeat [EXPECT_FAIL] (1) |

## 4) 心跳保活检查
- `KA-Heartbeat` 调用次数: **6**
- 心跳间隔(秒): 10.1, 10.0, 10.0, 10.1, 10.0
- 心跳平均间隔: **10.05s**

## 5) 时序调用明细（按时间）
01. [2026-03-17 17:36:01.404] `INIT - keepalive vars` | PASS | code=200 OK | 49ms
    URL: null
02. [2026-03-17 17:36:01.404] `INIT - Load Mapping & Runtime Vars` | PASS | code=200 OK | 258ms
    URL: null
03. [2026-03-17 17:36:01.623] `KA-Login` | PASS | code=200 OK | 312ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/login
04. [2026-03-17 17:36:01.663] `FUNC-Login` | FAIL | code=500 Internal Server Error | 38ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/login
    Failure: Test failed: text expected to contain /"code":0/
05. [2026-03-17 17:36:01.733] `FUNC-QueryCourseList` | FAIL | code=401 Unauthorized | 12ms
    URL: http://192.168.0.90/api/admin/nexalapi/resource/v1/queryCourseList
    Failure: Test failed: text expected to contain /"code":0/
06. [2026-03-17 17:36:01.746] `FUNC-GetCourseChapterTaskList` | FAIL | code=401 Unauthorized | 28ms
    URL: http://192.168.0.90/api/admin/nexalapi/resource/v1/getCourseChapterTaskList?courseId=2032055666142167042&teachingTaskId=2033505568785190913
    Failure: Test failed: text expected to contain /"code":0/
07. [2026-03-17 17:36:01.790] `MARK - PRECONDITION_MISSING userReportId` | PASS | code=200 PRECONDITION_MISSING: userReportId is empty, dependent positive APIs skipped | 6ms
    URL: null
08. [2026-03-17 17:36:01.797] `FUNC-QuitTeachingTask` | FAIL | code=401 Unauthorized | 20ms
    URL: http://192.168.0.90/api/admin/nexalapi/exp/v1/quitTeachingTask?courseId=2032055666142167042&teachingTaskId=2033505568785190913
    Failure: Test failed: text expected to contain /"code":0/
09. [2026-03-17 17:36:01.818] `FUNC-QuitCourse` | FAIL | code=401 Unauthorized | 26ms
    URL: http://192.168.0.90/api/admin/nexalapi/exp/v1/quitCourse?courseId=2032055666142167042
    Failure: Test failed: text expected to contain /"code":0/
10. [2026-03-17 17:36:01.845] `FUNC-Logout` | FAIL | code=401 Unauthorized | 24ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/logout
    Failure: Test failed: text expected to contain /"code":0/
11. [2026-03-17 17:36:11.953] `KA-Heartbeat` | PASS | code=200 OK | 55ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
12. [2026-03-17 17:36:22.012] `KA-Heartbeat` | PASS | code=200 OK | 40ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
13. [2026-03-17 17:36:32.056] `KA-Heartbeat` | PASS | code=200 OK | 38ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
14. [2026-03-17 17:36:42.101] `KA-Heartbeat` | PASS | code=200 OK | 44ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
15. [2026-03-17 17:36:52.153] `KA-Heartbeat` | PASS | code=200 OK | 36ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
16. [2026-03-17 17:37:02.196] `KA-Heartbeat` | PASS | code=200 OK | 33ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
17. [2026-03-17 17:37:02.233] `KA-QueryCourseList-Alive [EXPECT_OK]` | PASS | code=200 OK | 55ms
    URL: http://192.168.0.90/api/admin/nexalapi/resource/v1/queryCourseList
18. [2026-03-17 17:37:37.304] `KA-QueryCourseList-AfterExpire [EXPECT_FAIL]` | FAIL | code=200 OK | 53ms
    URL: http://192.168.0.90/api/admin/nexalapi/resource/v1/queryCourseList
    Failure: Expected failure but got success: KA-QueryCourseList-AfterExpire [EXPECT_FAIL]
19. [2026-03-17 17:37:37.358] `KA-Heartbeat-AfterExpire [EXPECT_FAIL]` | FAIL | code=200 OK | 31ms
    URL: http://192.168.0.90/api/admin/nexalapi/base/v1/heartbeat
    Failure: Expected failure but got success: KA-Heartbeat-AfterExpire [EXPECT_FAIL]
20. [2026-03-17 17:37:37.390] `KA-QueryCourseList-AfterExpiredHeartbeat [EXPECT_FAIL]` | FAIL | code=200 OK | 48ms
    URL: http://192.168.0.90/api/admin/nexalapi/resource/v1/queryCourseList
    Failure: Expected failure but got success: KA-QueryCourseList-AfterExpiredHeartbeat [EXPECT_FAIL]
