# 报告输入文件说明（严格模式）

`generate_formal_reports.py` 采用严格数据驱动模式，以下输入均为必填：

1. `functional.jtl`
- 功能执行结果（建议包含 `FUNC-*`、`EX-*`、`KA-*` 样本）

2. `performance.jtl`
- 性能执行结果（建议样本命名为 `PERF-00X-*`）

3. `defects.csv` 或 `defects.json`
- 必需字段：`id,severity,module,title,status`

4. `report_meta.json` 或 `report_meta.yaml`
- 建议从 `report_meta.sample.json` 拷贝并修改

## 快速开始

```bash
python3 jmeter/scripts/generate_formal_reports.py \
  --functional-jtl jmeter/results_functional.jtl \
  --performance-jtl jmeter/results_performance.jtl \
  --defects jmeter/report_inputs/defects.sample.csv \
  --meta jmeter/report_inputs/report_meta.sample.json \
  --jmx jmeter/test-plan.jmx \
  --output-dir jmeter/docs
```

## 严格模式行为
- 任一输入缺失：脚本直接报错并退出（非 0）。
- 性能样本命名不匹配 `PERF-00X-*`：报告中会列出“未映射样本”。
