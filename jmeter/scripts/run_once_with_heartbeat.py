#!/usr/bin/env python3
"""Run one full functional chain for a single account with heartbeat keepalive.

Outputs:
- jmeter/results/<username>_once_functional_detail.json
- jmeter/results/<username>_once_functional_detail.md
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import random
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional


def now_str() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def read_user_report_id(mapping_csv: Path, username: str) -> str:
    if not mapping_csv.exists():
        return ""
    with mapping_csv.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if (row.get("username") or "").strip() == username:
                return (row.get("userReportId") or "").strip()
    return ""


def safe_json_loads(text: str) -> Optional[Dict[str, Any]]:
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


def unique_numeric_answers(count: int, min_value: int = 1, max_value: int = 9999) -> List[str]:
    count = max(count, 1)
    values: List[str] = []
    seen = set()
    max_unique = max_value - min_value + 1
    while len(values) < count:
        candidate = str(random.randint(min_value, max_value))
        if candidate not in seen or len(seen) >= max_unique:
            seen.add(candidate)
            values.append(candidate)
    return values


def build_question_answer_list(content_response_body: str) -> List[Dict[str, Any]]:
    # 当前报告固定使用这三个 subtitleId，不随每次提取变化。
    gap_subtitle_ids = ["ribcrlV6xK", "Uv9NC4virf", "lHBYTCtXty"]
    single_block_id = "oaXh7gOyKt"
    single_answer = "uD2mKpkAmc"
    gap_block_id = "YndHSdJkXa"

    root = safe_json_loads(content_response_body) or {}
    content_text = ""
    if isinstance(root, dict):
        data_obj = root.get("data")
        if isinstance(data_obj, dict):
            content_text = str(data_obj.get("content") or "")

    inner: Optional[Dict[str, Any]] = None
    if content_text:
        inner = safe_json_loads(content_text)

    if isinstance(inner, dict):
        blocks = inner.get("blocks")
        if isinstance(blocks, list):
            for block in blocks:
                if not isinstance(block, dict):
                    continue
                block_type = str(block.get("type") or "")
                block_id = str(block.get("id") or "")
                if block_type == "SingleChoice" and block_id:
                    single_block_id = block_id
                    settings = (block.get("data") or {}).get("settings") if isinstance(block.get("data"), dict) else None
                    if isinstance(settings, dict):
                        single_answer = str(settings.get("reference") or single_answer)
                if block_type == "GapFilling" and block_id:
                    gap_block_id = block_id

    values = unique_numeric_answers(len(gap_subtitle_ids), 1, 9999)
    gap_list = [
        {"subtitleId": gap_subtitle_ids[idx], "subtitleAnswer": values[idx]}
        for idx in range(len(gap_subtitle_ids))
    ]

    return [
        {
            "blockId": single_block_id,
            "blockType": "SingleChoice",
            "subtitleAnswerList": [{"subtitleId": "", "subtitleAnswer": single_answer}],
        },
        {
            "blockId": gap_block_id,
            "blockType": "GapFilling",
            "subtitleAnswerList": gap_list,
        },
    ]


def mask_auth(headers: Dict[str, str]) -> Dict[str, str]:
    out = dict(headers)
    auth = out.get("Authorization", "")
    if auth:
        out["Authorization"] = f"{auth[:24]}...(len={len(auth)})"
    return out


def http_call(
    *,
    label: str,
    base_url: str,
    method: str,
    path: str,
    headers: Dict[str, str],
    query: Optional[Dict[str, Any]] = None,
    body_obj: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    query_str = ""
    if query:
        query_str = urllib.parse.urlencode(query)
    url = f"{base_url.rstrip('/')}{path}"
    if query_str:
        url = f"{url}?{query_str}"

    body_text = ""
    body_bytes = None
    if body_obj is not None:
        body_text = json.dumps(body_obj, ensure_ascii=False, separators=(",", ":"))
        body_bytes = body_text.encode("utf-8")

    req = urllib.request.Request(url=url, data=body_bytes, method=method.upper())
    for k, v in headers.items():
        req.add_header(k, v)

    ts_start = time.time()
    rec: Dict[str, Any] = {
        "label": label,
        "time": now_str(),
        "method": method.upper(),
        "url": url,
        "request_headers": mask_auth(headers),
        "request_body": body_text,
        "ok": False,
        "status_code": None,
        "reason": "",
        "response_headers": {},
        "response_body": "",
        "duration_ms": None,
        "error": "",
    }
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            rec["status_code"] = int(resp.status)
            rec["reason"] = resp.reason or ""
            rec["response_headers"] = dict(resp.headers.items())
            rec["response_body"] = body
            rec["ok"] = 200 <= int(resp.status) < 300
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        rec["status_code"] = int(e.code)
        rec["reason"] = str(e.reason or "")
        rec["response_headers"] = dict(e.headers.items()) if e.headers else {}
        rec["response_body"] = body
        rec["ok"] = False
    except Exception as e:  # network / timeout / parse
        rec["error"] = str(e)
        rec["ok"] = False
    finally:
        rec["duration_ms"] = int((time.time() - ts_start) * 1000)
    return rec


def build_markdown(
    *,
    username: str,
    base_url: str,
    records: List[Dict[str, Any]],
    heartbeat_records: List[Dict[str, Any]],
    user_report_id: str,
) -> str:
    total = len(records)
    ok = sum(1 for r in records if r.get("ok"))
    fail = total - ok
    lines: List[str] = []
    lines.append(f"# {username} 单次功能链路 + 心跳保活执行明细")
    lines.append("")
    lines.append("## 1) 执行参数")
    lines.append(f"- 账号: `{username}`")
    lines.append(f"- baseUrl: `{base_url}`")
    lines.append("- 场景: 登录后启动心跳（每10秒），主功能接口各调用1次")
    lines.append(f"- userReportId(映射): `{user_report_id or '空'}`")
    lines.append("")
    lines.append("## 2) 结果汇总")
    lines.append(f"- 总调用数: **{total}**")
    lines.append(f"- 成功: **{ok}**")
    lines.append(f"- 失败: **{fail}**")
    lines.append(f"- 成功率: **{(ok / total * 100):.2f}%**" if total else "- 成功率: N/A")
    lines.append(f"- 心跳调用次数: **{len(heartbeat_records)}**")
    if len(heartbeat_records) >= 2:
        hb_ts = []
        for r in heartbeat_records:
            try:
                hb_ts.append(dt.datetime.strptime(r["time"], "%Y-%m-%d %H:%M:%S.%f").timestamp())
            except Exception:
                pass
        if len(hb_ts) >= 2:
            intervals = [hb_ts[i] - hb_ts[i - 1] for i in range(1, len(hb_ts))]
            avg_itv = sum(intervals) / len(intervals)
            lines.append(f"- 心跳平均间隔: **{avg_itv:.2f}s**")
            lines.append(f"- 心跳间隔序列: {', '.join(f'{x:.2f}' for x in intervals)}")
    lines.append("")
    lines.append("## 3) 调用清单（按时序）")
    lines.append("| # | 时间 | Label | Method | Status | 耗时(ms) |")
    lines.append("|---|---|---|---|---:|---:|")
    for i, r in enumerate(records, 1):
        status = r.get("status_code")
        status_txt = str(status) if status is not None else f"ERR:{r.get('error','')}"
        lines.append(
            f"| {i} | {r.get('time','')} | `{r.get('label','')}` | {r.get('method','')} | {status_txt} | {r.get('duration_ms','')} |"
        )
    lines.append("")
    lines.append("## 4) 401 / 失败详单（含请求与返回）")
    failures = [r for r in records if (not r.get("ok")) or r.get("status_code") == 401]
    if not failures:
        lines.append("- 无失败/401。")
    else:
        for i, r in enumerate(failures, 1):
            lines.append(f"### 4.{i} `{r.get('label','')}`")
            lines.append(f"- 时间: {r.get('time','')}")
            lines.append(f"- 请求: `{r.get('method','')} {r.get('url','')}`")
            lines.append(f"- 请求头: `{json.dumps(r.get('request_headers', {}), ensure_ascii=False)}`")
            if r.get("request_body"):
                lines.append(f"- 请求体: `{r.get('request_body')}`")
            else:
                lines.append("- 请求体: `<empty>`")
            lines.append(
                f"- 响应: `status={r.get('status_code')} reason={r.get('reason','')} duration={r.get('duration_ms')}ms`"
            )
            if r.get("error"):
                lines.append(f"- 错误: `{r.get('error')}`")
            if r.get("response_headers"):
                lines.append(f"- 响应头: `{json.dumps(r.get('response_headers', {}), ensure_ascii=False)}`")
            body = r.get("response_body", "")
            lines.append("- 响应体:")
            lines.append("```text")
            lines.append(body if body else "<empty>")
            lines.append("```")
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--username", default="hlqiongs")
    parser.add_argument("--password", default="P3+GebaL")
    parser.add_argument("--base-url", default="http://192.168.0.90/api")
    parser.add_argument("--mapping", default="jmeter/data/account_report_mapping.csv")
    parser.add_argument("--out-dir", default="jmeter/results")
    parser.add_argument("--heartbeat-seconds", type=int, default=10)
    parser.add_argument("--heartbeat-run-seconds", type=int, default=35)
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    user_report_id = read_user_report_id(Path(args.mapping), args.username)

    course_id = "2032055666142167042"
    teaching_task_id = "2033505568785190913"
    block_id = "3O00nCpPKp"
    common_headers = {
        "Content-Type": "application/json",
        "clientKey": "test-client",
        "clientVersion": "V1.0",
    }

    records: List[Dict[str, Any]] = []
    heartbeat_records: List[Dict[str, Any]] = []
    stop_hb = threading.Event()
    access_token = ""

    login_mac = str(random.randint(10_000_000_000, 99_999_999_999))
    login_rec = http_call(
        label="FUNC-Login",
        base_url=args.base_url,
        method="POST",
        path="/admin/nexalapi/base/v1/login",
        headers=common_headers,
        body_obj={"userName": args.username, "password": args.password, "mac": login_mac},
    )
    records.append(login_rec)
    login_json = safe_json_loads(login_rec.get("response_body", "")) or {}
    access_token = ((login_json.get("data") or {}).get("accessToken") or "") if isinstance(login_json, dict) else ""

    auth_headers = dict(common_headers)
    if access_token:
        auth_headers["Authorization"] = f"Bearer {access_token}"

    def hb_worker() -> None:
        first = True
        while not stop_hb.is_set():
            if first:
                first = False
            else:
                if stop_hb.wait(args.heartbeat_seconds):
                    break
            rec = http_call(
                label="KA-Heartbeat",
                base_url=args.base_url,
                method="POST",
                path="/admin/nexalapi/base/v1/heartbeat",
                headers=auth_headers,
                body_obj={},
            )
            heartbeat_records.append(rec)
            records.append(rec)

    hb_thread = threading.Thread(target=hb_worker, daemon=True)
    hb_thread.start()

    records.append(
        http_call(
            label="FUNC-QueryCourseList",
            base_url=args.base_url,
            method="GET",
            path="/admin/nexalapi/resource/v1/queryCourseList",
            headers=auth_headers,
        )
    )
    records.append(
        http_call(
            label="FUNC-GetCourseChapterTaskList",
            base_url=args.base_url,
            method="GET",
            path="/admin/nexalapi/resource/v1/getCourseChapterTaskList",
            headers=auth_headers,
            query={"courseId": course_id, "teachingTaskId": teaching_task_id},
        )
    )
    records.append(
        http_call(
            label="FUNC-QueryExpGuidebookCatalog",
            base_url=args.base_url,
            method="GET",
            path="/admin/nexalapi/resource/v1/queryExpGuidebookCatalog",
            headers=auth_headers,
            query={"courseId": course_id, "teachingTaskId": teaching_task_id},
        )
    )
    content_rec = http_call(
        label="FUNC-QueryExpGuidebookContent",
        base_url=args.base_url,
        method="GET",
        path="/admin/nexalapi/resource/v1/queryExpGuidebookContent",
        headers=auth_headers,
        query={
            "courseId": course_id,
            "teachingTaskId": teaching_task_id,
            "blockId": block_id,
            "userReportId": user_report_id,
        },
    )
    records.append(content_rec)

    question_answer_list = build_question_answer_list(content_rec.get("response_body", ""))

    records.append(
        http_call(
            label="FUNC-saveQuestionAnswer",
            base_url=args.base_url,
            method="POST",
            path="/admin/nexalapi/exp/v1/saveQuestionAnswer",
            headers=auth_headers,
            body_obj={
                "userReportId": user_report_id,
                "questionAnswerList": question_answer_list,
            },
        )
    )
    records.append(
        http_call(
            label="FUNC-SaveExpAnswerRecord",
            base_url=args.base_url,
            method="POST",
            path="/admin/camClientExpAnswerRecord/saveExpAnswerRecord",
            headers=auth_headers,
            body_obj={
                "courseId": course_id,
                "teachingTaskId": teaching_task_id,
                "blockId": block_id,
                "userReportId": user_report_id,
                "answerRecord": json.dumps(
                    {"questionAnswerList": question_answer_list, "ts": int(time.time() * 1000)},
                    ensure_ascii=False,
                ),
            },
        )
    )
    records.append(
        http_call(
            label="FUNC-QuitTeachingTask",
            base_url=args.base_url,
            method="GET",
            path="/admin/nexalapi/exp/v1/quitTeachingTask",
            headers=auth_headers,
            query={"courseId": course_id, "teachingTaskId": teaching_task_id},
        )
    )
    records.append(
        http_call(
            label="FUNC-QuitCourse",
            base_url=args.base_url,
            method="GET",
            path="/admin/nexalapi/exp/v1/quitCourse",
            headers=auth_headers,
            query={"courseId": course_id},
        )
    )

    # Keep heartbeat running a bit longer to verify keepalive behavior during session.
    stop_hb.wait(args.heartbeat_run_seconds)

    records.append(
        http_call(
            label="FUNC-Logout",
            base_url=args.base_url,
            method="POST",
            path="/admin/nexalapi/base/v1/logout",
            headers=auth_headers,
            body_obj={},
        )
    )

    stop_hb.set()
    hb_thread.join(timeout=2)

    output_json = out_dir / f"{args.username}_once_functional_detail.json"
    output_md = out_dir / f"{args.username}_once_functional_detail.md"

    output_json.write_text(
        json.dumps(
            {
                "username": args.username,
                "baseUrl": args.base_url,
                "generatedAt": now_str(),
                "userReportId": user_report_id,
                "records": records,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    output_md.write_text(
        build_markdown(
            username=args.username,
            base_url=args.base_url,
            records=records,
            heartbeat_records=heartbeat_records,
            user_report_id=user_report_id,
        ),
        encoding="utf-8",
    )

    print(f"[OK] JSON: {output_json}")
    print(f"[OK] Markdown: {output_md}")
    print(f"[INFO] total={len(records)} success={sum(1 for r in records if r.get('ok'))} fail={sum(1 for r in records if not r.get('ok'))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
