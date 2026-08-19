# dsh-json-validate · JSON 校验与修复

校验 JSON 语法并定位错误，自动修复常见格式错误（注释/尾逗号/单引号）。纯 Node 实现。

## 提供的工具

| 工具 | 作用 |
|---|---|
| `validate_json` | 校验 + 错误定位（行列） |
| `fix_json` | 修复注释/尾逗号/单引号 |

## 安装

```bash
dsh plugin add dsh-json-validate
```
安装后在 profile 的 `package.json` 的 `dsh.profile.bundles` 中加入 `"dsh-json-validate"`。

## 用法示例

```
这段 JSON 报错了，帮我看看哪里有问题
→ 调用 validate_json(text="...")
```

## 安装

```bash
dsh plugin add github:uckkk/dsh-json-validate
```

> 安装即在本机运行第三方代码，请自行审阅源码。

## 安装

```bash
dsh plugin add github:uckkk/dsh-json-validate
```

## 使用

安装后在会话中调用该插件注册的工具即可。

## 许可

MIT
