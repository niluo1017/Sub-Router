import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ApiEndpoints from '../components/ApiEndpoints';

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success('已复制');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl border border-page-divider bg-page-inset overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-page-divider">
          <span className="text-xs text-page-muted">{label}</span>
          <button onClick={copy} className="text-xs text-brand-500 hover:text-brand-600">
            {copied ? '已复制 ✓' : '复制'}
          </button>
        </div>
      )}
      <pre className="px-4 py-3 overflow-x-auto text-[13px] leading-relaxed text-page-label whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-500">
          {n}
        </span>
        <h2 className="text-lg font-semibold text-page">{title}</h2>
      </div>
      <div className="pl-11 flex flex-col gap-3 text-sm text-page-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function UsageDocs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-page mb-3">使用文档</h1>
        <p className="text-page-secondary">
          三步接入：获取密钥 → 选择调用地址 → 填进你的工具。全部模型统一 OpenAI 兼容接口，也支持 Anthropic 原生格式。
        </p>
      </div>

      <Step n={1} title="获取 API 密钥">
        <p>
          <b className="text-page">第一步，登录后先进入「控制台」</b>——顶部导航点 <Link to="/dashboard" className="text-brand-500 hover:text-brand-600 font-medium">控制台</Link>。API 密钥的管理入口在控制台里，需要先进控制台才能找到。
        </p>
        <p>
          <b className="text-page">第二步，进入「API 密钥」页面</b>——在 <Link to="/tokens" className="text-brand-500 hover:text-brand-600 font-medium">API 密钥</Link> 页，点击右上角的「创建 API 密钥」按钮。
        </p>
        <p>
          <b className="text-page">第三步，选择分组并创建</b>——在弹出的窗口里，从「模型分组」下拉框选择:默认「全站调用」可用全部模型;也可以选 GPT、Opus、图像通道等指定分组。填写一个名称(方便你区分不同用途),额度/过期时间可留默认,点「创建」。
        </p>
        <p>
          <b className="text-page">第四步，复制并保存密钥</b>——创建成功后会弹出完整的 <code className="px-1.5 py-0.5 rounded bg-page-surface text-page-label font-mono text-xs">sk-</code> 开头密钥,点「复制密钥」保存好。<b className="text-page-danger">注意:出于安全,完整密钥只显示这一次</b>,关闭后在列表里只能看到打码的密钥。
        </p>
      </Step>

      <Step n={2} title="选择调用地址（Base URL）">
        <p>创建密钥后，从下面任选一条最适合你网络的线路作为 Base URL。点击地址即可复制：</p>
        <div className="w-full -ml-11 sm:ml-0">
          <ApiEndpoints hideSite />
        </div>
        <p className="text-xs text-page-muted">
          说明：「大陆线路」适合中国大陆网络访问；「海外直链」海外网络速度更快。三条线路都调用同一套后端，价格与模型完全一致。
        </p>
      </Step>

      <Step n={3} title="通用调用示例">
        <p>OpenAI 兼容格式（下例用海外直链地址，可换成大陆线路；把 <code className="font-mono text-xs">sk-你的密钥</code> 换成你的）：</p>
        <CodeBlock
          label="curl · OpenAI 兼容"
          code={`curl https://test1122.up.railway.app/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的密钥" \\
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
        />
        <p className="mt-2">Anthropic 原生格式（Claude 官方 SDK 用户）：Base URL 直接填线路地址（不带 /v1）。</p>
      </Step>

      <Step n={4} title="接入 Claude Code">
        <p>Claude Code 通过两个环境变量指向本站即可，把 <code className="font-mono text-xs">sk-你的密钥</code> 换成你的密钥：</p>
        <CodeBlock
          label="macOS / Linux — 写入 ~/.zshrc 或 ~/.bashrc"
          code={`export ANTHROPIC_BASE_URL="https://test1122.up.railway.app"
export ANTHROPIC_AUTH_TOKEN="sk-你的密钥"`}
        />
        <CodeBlock
          label="Windows PowerShell"
          code={`[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://test1122.up.railway.app", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-你的密钥", "User")`}
        />
        <p>然后新开终端运行 <code className="font-mono text-xs">claude</code>。进入后用 <code className="font-mono text-xs">/model</code> 命令切换模型，如 <code className="font-mono text-xs">claude-opus-4-8</code>、<code className="font-mono text-xs">claude-sonnet-5</code>。国内网络连不上就把 BASE_URL 换成大陆线路 <code className="font-mono text-xs">https://ai.orbitlink.me</code>。</p>
      </Step>

      <Step n={5} title="接入 Codex（OpenAI Codex CLI）">
        <p>Codex 支持自定义模型服务商。编辑配置文件 <code className="font-mono text-xs">~/.codex/config.toml</code>，加入本站作为服务商：</p>
        <CodeBlock
          label="~/.codex/config.toml"
          code={`model = "gpt-5.6-sol"
model_provider = "linglong"

[model_providers.linglong]
name = "灵珑AI"
base_url = "https://test1122.up.railway.app/v1"
env_key = "LINGLONG_API_KEY"`}
        />
        <p>再设置环境变量放你的密钥，然后正常运行 <code className="font-mono text-xs">codex</code>：</p>
        <CodeBlock code={`export LINGLONG_API_KEY="sk-你的密钥"`} />
        <p>模型名可换成任意支持的对话模型（gpt-5.6-sol、gpt-5.5-pro、claude-opus-4-8 等）。</p>
      </Step>

      <Step n={6} title="接入 CC Switch（一键切换配置）">
        <p>CC Switch 用来给 Claude Code 快速切换不同服务商。打开 CC Switch，点「新增配置」，按下表填写：</p>
        <div className="rounded-xl border border-page-divider overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-page-divider"><td className="px-4 py-2.5 text-page-muted w-32">配置名称</td><td className="px-4 py-2.5 text-page">灵珑AI（自定义）</td></tr>
              <tr className="border-b border-page-divider"><td className="px-4 py-2.5 text-page-muted">Base URL</td><td className="px-4 py-2.5 font-mono text-xs text-page-label">https://test1122.up.railway.app</td></tr>
              <tr className="border-b border-page-divider"><td className="px-4 py-2.5 text-page-muted">API Key</td><td className="px-4 py-2.5 font-mono text-xs text-page-label">sk-你的密钥</td></tr>
              <tr><td className="px-4 py-2.5 text-page-muted">模型</td><td className="px-4 py-2.5 font-mono text-xs text-page-label">claude-opus-4-8</td></tr>
            </tbody>
          </table>
        </div>
        <p>保存后在 CC Switch 里选中这条配置即可一键切换，之后启动的 Claude Code 就会走本站。国内网络把 Base URL 换成 <code className="font-mono text-xs">https://ai.orbitlink.me</code>。</p>
      </Step>

      <Step n={7} title="调用图像 / 生图模型">
        <p>本站的图像模型（<code className="font-mono text-xs">gpt-image-2</code>、<code className="font-mono text-xs">nano-banana-pro-2k</code>、<code className="font-mono text-xs">gemini-3-pro-image-preview</code> 等）用 OpenAI 兼容的图像接口调用，端点是 <code className="font-mono text-xs">/v1/images/generations</code>：</p>
        <CodeBlock
          label="curl · 生图"
          code={`curl https://test1122.up.railway.app/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的密钥" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "一只在星空下奔跑的柴犬，插画风格",
    "size": "1024x1024"
  }'`}
        />
        <p>在支持「图像生成」的客户端（如 LobeChat、NextChat）里，服务商选 OpenAI 兼容、地址填线路地址、密钥填你的 Key，模型选上面任意图像模型，就能在对话框里直接出图。视频模型（<code className="font-mono text-xs">seedance-2.0</code>、<code className="font-mono text-xs">grok-video</code>）同理，按次计费，具体参数见 <Link to="/pricing" className="text-brand-500 hover:text-brand-600">定价页</Link>。</p>
      </Step>

      <Step n={8} title="接入沉浸式翻译 / LobeChat / NextChat">
        <p>这类工具选「自定义 / OpenAI 兼容」服务，接口地址填 <code className="font-mono text-xs">https://test1122.up.railway.app/v1/chat/completions</code>（国内用 <code className="font-mono text-xs">https://ai.orbitlink.me/v1/chat/completions</code>），填入密钥，模型选你要的即可。沉浸式翻译推荐用 <code className="font-mono text-xs">gemini-3.5-flash</code> 或 <code className="font-mono text-xs">deepseek-v4-flash</code>，快且便宜。</p>
      </Step>

      <div className="rounded-xl border border-page-divider bg-page-surface/50 p-5 text-sm text-page-secondary">
        遇到问题？可在控制台提交工单，或查看 <Link to="/pricing" className="text-brand-500 hover:text-brand-600">定价页</Link> 了解全部模型与实时价格。
      </div>
    </div>
  );
}
