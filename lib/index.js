// dsh-json-validate — JSON 校验与修复（DeepSeek Harness）。
// 校验 JSON 语法并定位错误，自动修复常见格式错误（尾逗号、单引号、注释）。纯 Node。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "JSON 校验";
const inject = ["tools"];

function findError(text) {
  try { JSON.parse(text); return null; }
  catch (e) {
    const m = /position (\d+)/.exec(e.message);
    const pos = m ? Number(m[1]) : -1;
    if (pos < 0) return { message: e.message, line: -1, column: -1 };
    const before = text.slice(0, pos);
    const line = before.split("\n").length;
    const column = pos - before.lastIndexOf("\n");
    return { message: e.message, line, column };
  }
}

function fixJson(text) {
  let s = String(text);
  const applied = [];
  // 去注释
  const noComment = s.replace(/^\s*\/\/.*$/gm, "").replace(/^\s*#.*$/gm, "");
  if (noComment !== s) { applied.push("去掉行注释"); s = noComment; }
  // 尾逗号（在 } 或 ] 前）
  const noTrailing = s.replace(/,\s*([}\]])/g, "$1");
  if (noTrailing !== s) { applied.push("去掉尾逗号"); s = noTrailing; }
  // 单引号键和值 → 双引号（粗略：成对单引号）
  // 只处理简单的 "key": 'value' 情况
  const singleQuoteVal = s.replace(/:\s*'([^']*)'/g, ': "$1"');
  if (singleQuoteVal !== s) { applied.push("单引号值转双引号"); s = singleQuoteVal; }
  return { fixed: s, applied };
}

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "validate_json",
    description:
      "校验 JSON 语法，返回是否合法；非法时返回错误信息与行列位置。`text` 传 JSON 文本。",
    parameters: {
      text: { type: "string", required: true, description: "JSON 文本。" },
    },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          valid: { type: "boolean", required: true },
          message: { type: "string", required: true },
          line: { type: "integer", required: true },
          column: { type: "integer", required: true },
        },
      },
      render: (_args, value) => [{ type: "text", text: value.valid ? "✓ JSON 合法" : `✗ JSON 非法（第 ${value.line} 行第 ${value.column} 列）：${value.message}` }],
    },
    execute: async (args) => {
      const err = findError(args.text);
      if (!err) return { valid: true, message: "", line: 0, column: 0 };
      return { valid: false, message: err.message, line: err.line, column: err.column };
    },
  }));

  ctx.tools.register(defineTool({
    name: "fix_json",
    description:
      "自动修复常见 JSON 格式错误：行注释、尾逗号、单引号字符串值。返回修复后的文本与已应用的修复项。`text` 传有问题的 JSON 文本。",
    parameters: {
      text: { type: "string", required: true, description: "有问题的 JSON 文本。" },
    },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          fixed: { type: "string", required: true },
          applied: { type: "array", required: true, items: { type: "string" } },
          valid: { type: "boolean", required: true },
        },
      },
      render: (_args, value) => [{
        type: "text",
        text: `${value.valid ? "✓ 修复后可解析" : "⚠ 修复后仍非法"}\n修复项：${value.applied.join("、") || "无"}\n${value.fixed.slice(0, 2000)}`,
      }],
    },
    execute: async (args) => {
      const r = fixJson(args.text);
      let valid = false;
      try { JSON.parse(r.fixed); valid = true; } catch {}
      return { fixed: r.fixed, applied: r.applied, valid };
    },
  }));
}

export { apply, inject, name };
