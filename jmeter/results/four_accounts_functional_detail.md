# 4账号功能测试调用明细（单次完整链路，含心跳）

执行口径：每个账号执行 1 次完整流程，`KA-Heartbeat` 保活线程同时运行，不做压测。

## 总览

| 账号 | 总调用 | 成功 | 失败 | 成功率 |
|---|---:|---:|---:|---:|
| `zhengpengst` | 11 | 11 | 0 | 100.00% |
| `hlqiongs` | 11 | 11 | 0 | 100.00% |
| `zshaos1` | 11 | 11 | 0 | 100.00% |
| `huyonglans1` | 11 | 11 | 0 | 100.00% |

## 账号 `zhengpengst`

- baseUrl: `http://192.168.0.90/api`
- 执行时间: `2026-03-17 19:04:51.561`

| 接口 | 方法 | HTTP | 耗时(ms) | 结果 | 返回摘要 |
|---|---|---:|---:|---|---|
| `FUNC-Login` | POST | 200 | 322 | PASS | {"code":0,"msg":"登录成功！","data":{"accessToken":"4b101e28-3cb3-4b4b-9088-e6f3ad8d97a1","refreshToken":"hsH7GTOfjqa0JRGYuIXKFRzbfL8Pi3WomWbe-HkZ3GX3OYJ9u7hVgETmWyz0pwI6QlRYZG5anfZisie... |
| `KA-Heartbeat` | POST | 200 | 59 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QueryCourseList` | GET | 200 | 87 | PASS | {"code":0,"msg":null,"data":[{"id":"2032055666142167042","name":"123123123","groupType":null,"cover":null,"introduction":null,"courseOutline":"0","content":null,"code":null,"status... |
| `FUNC-GetCourseChapterTaskList` | GET | 200 | 82 | PASS | {"code":0,"msg":null,"data":[{"chapterId":null,"chapterName":"教学任务","chapterTaskInfoList":[{"teachingTaskId":"2033505568785190913","teachingTaskName":"测试","resourcesType":"0","user... |
| `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 51 | PASS | {"code":0,"msg":null,"data":[{"answered":null,"id":"I2vrLh5hLU","type":"expPurpose","label":"一、实验目的","level":3,"index":null,"children":[]},{"answered":null,"id":"ZXlTkgVviI","type"... |
| `FUNC-QueryExpGuidebookContent` | GET | 200 | 61 | PASS | {"code":0,"msg":null,"data":{"expInfo":"0","courseInfoId":"2032055666142167042","resourceType":"0","type":0,"resourcesInfo":"2031255602389909505","content":"{\"blocks\":[{\"tunes\"... |
| `FUNC-saveQuestionAnswer` | POST | 200 | 151 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-SaveExpAnswerRecord` | POST | 200 | 33 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitTeachingTask` | GET | 200 | 41 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitCourse` | GET | 200 | 28 | PASS | {"code":0,"msg":null,"data":null,"ok":true} |
| `FUNC-Logout` | POST | 200 | 53 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |

## 账号 `hlqiongs`

- baseUrl: `http://192.168.0.90/api`
- 执行时间: `2026-03-17 19:05:03.894`

| 接口 | 方法 | HTTP | 耗时(ms) | 结果 | 返回摘要 |
|---|---|---:|---:|---|---|
| `FUNC-Login` | POST | 200 | 379 | PASS | {"code":0,"msg":"登录成功！","data":{"accessToken":"4979d3b5-c427-4331-ad97-14fb9549e45b","refreshToken":"Dy6x3McMRIzTFcy9L-iePP5vOw8VfV2h83Fc1nDfhHipgsPXUf5EULfPoNS7a7NlasVRCEGiIOwLzbt... |
| `KA-Heartbeat` | POST | 200 | 77 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QueryCourseList` | GET | 200 | 89 | PASS | {"code":0,"msg":null,"data":[{"id":"2032055666142167042","name":"123123123","groupType":null,"cover":null,"introduction":null,"courseOutline":"0","content":null,"code":null,"status... |
| `FUNC-GetCourseChapterTaskList` | GET | 200 | 84 | PASS | {"code":0,"msg":null,"data":[{"chapterId":null,"chapterName":"教学任务","chapterTaskInfoList":[{"teachingTaskId":"2033505568785190913","teachingTaskName":"测试","resourcesType":"0","user... |
| `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 57 | PASS | {"code":0,"msg":null,"data":[{"answered":null,"id":"I2vrLh5hLU","type":"expPurpose","label":"一、实验目的","level":3,"index":null,"children":[]},{"answered":null,"id":"ZXlTkgVviI","type"... |
| `FUNC-QueryExpGuidebookContent` | GET | 200 | 62 | PASS | {"code":0,"msg":null,"data":{"expInfo":"0","courseInfoId":"2032055666142167042","resourceType":"0","type":0,"resourcesInfo":"2031255602389909505","content":"{\"blocks\":[{\"tunes\"... |
| `FUNC-saveQuestionAnswer` | POST | 200 | 147 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-SaveExpAnswerRecord` | POST | 200 | 34 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitTeachingTask` | GET | 200 | 31 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitCourse` | GET | 200 | 27 | PASS | {"code":0,"msg":null,"data":null,"ok":true} |
| `FUNC-Logout` | POST | 200 | 45 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |

## 账号 `zshaos1`

- baseUrl: `http://192.168.0.90/api`
- 执行时间: `2026-03-17 19:05:16.577`

| 接口 | 方法 | HTTP | 耗时(ms) | 结果 | 返回摘要 |
|---|---|---:|---:|---|---|
| `FUNC-Login` | POST | 200 | 320 | PASS | {"code":0,"msg":"登录成功！","data":{"accessToken":"98ea9e3a-b52f-48b3-b034-92652defd933","refreshToken":"3BP5Cz7bpgg9ZyhMeHxpS_OXbjfucwWB0EVU2Cul7nekJDhUU5LZ4nNrMHHfMhl5KE8YqeMZoZ5lyLs... |
| `KA-Heartbeat` | POST | 200 | 63 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QueryCourseList` | GET | 200 | 88 | PASS | {"code":0,"msg":null,"data":[{"id":"2032055666142167042","name":"123123123","groupType":null,"cover":null,"introduction":null,"courseOutline":"0","content":null,"code":null,"status... |
| `FUNC-GetCourseChapterTaskList` | GET | 200 | 86 | PASS | {"code":0,"msg":null,"data":[{"chapterId":null,"chapterName":"教学任务","chapterTaskInfoList":[{"teachingTaskId":"2033505568785190913","teachingTaskName":"测试","resourcesType":"0","user... |
| `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 57 | PASS | {"code":0,"msg":null,"data":[{"answered":null,"id":"I2vrLh5hLU","type":"expPurpose","label":"一、实验目的","level":3,"index":null,"children":[]},{"answered":null,"id":"ZXlTkgVviI","type"... |
| `FUNC-QueryExpGuidebookContent` | GET | 200 | 64 | PASS | {"code":0,"msg":null,"data":{"expInfo":"0","courseInfoId":"2032055666142167042","resourceType":"0","type":0,"resourcesInfo":"2031255602389909505","content":"{\"blocks\":[{\"tunes\"... |
| `FUNC-saveQuestionAnswer` | POST | 200 | 140 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-SaveExpAnswerRecord` | POST | 200 | 36 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitTeachingTask` | GET | 200 | 32 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitCourse` | GET | 200 | 31 | PASS | {"code":0,"msg":null,"data":null,"ok":true} |
| `FUNC-Logout` | POST | 200 | 40 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |

## 账号 `huyonglans1`

- baseUrl: `http://192.168.0.90/api`
- 执行时间: `2026-03-17 19:05:28.294`

| 接口 | 方法 | HTTP | 耗时(ms) | 结果 | 返回摘要 |
|---|---|---:|---:|---|---|
| `FUNC-Login` | POST | 200 | 401 | PASS | {"code":0,"msg":"登录成功！","data":{"accessToken":"dfb07738-0b71-4190-af9a-f98efc0e6802","refreshToken":"Y6yAV0HToRi2FXKusfvXDyo-uT1ooLwLgkFLZwKcQiYfGMYrX_0wYRT6xu5nIZjJSAdoTTqRv03NK3x... |
| `KA-Heartbeat` | POST | 200 | 41 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QueryCourseList` | GET | 200 | 69 | PASS | {"code":0,"msg":null,"data":[{"id":"2032055666142167042","name":"123123123","groupType":null,"cover":null,"introduction":null,"courseOutline":"0","content":null,"code":null,"status... |
| `FUNC-GetCourseChapterTaskList` | GET | 200 | 69 | PASS | {"code":0,"msg":null,"data":[{"chapterId":null,"chapterName":"教学任务","chapterTaskInfoList":[{"teachingTaskId":"2033505568785190913","teachingTaskName":"测试","resourcesType":"0","user... |
| `FUNC-QueryExpGuidebookCatalog` | GET | 200 | 46 | PASS | {"code":0,"msg":null,"data":[{"answered":null,"id":"I2vrLh5hLU","type":"expPurpose","label":"一、实验目的","level":3,"index":null,"children":[]},{"answered":null,"id":"ZXlTkgVviI","type"... |
| `FUNC-QueryExpGuidebookContent` | GET | 200 | 55 | PASS | {"code":0,"msg":null,"data":{"expInfo":"0","courseInfoId":"2032055666142167042","resourceType":"0","type":0,"resourcesInfo":"2031255602389909505","content":"{\"blocks\":[{\"tunes\"... |
| `FUNC-saveQuestionAnswer` | POST | 200 | 127 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-SaveExpAnswerRecord` | POST | 200 | 32 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitTeachingTask` | GET | 200 | 33 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
| `FUNC-QuitCourse` | GET | 200 | 23 | PASS | {"code":0,"msg":null,"data":null,"ok":true} |
| `FUNC-Logout` | POST | 200 | 49 | PASS | {"code":0,"msg":null,"data":true,"ok":true} |
