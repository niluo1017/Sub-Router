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
          前往 <Link to="/tokens" className="text-brand-500 hover:text-brand-600 font-medium">API 密钥</Link> 页面，点击「创建 API 密钥」，在弹窗里选择分组（默认「全站调用」即可用全部模型），填个名称后创建。
        </p>
        <p>创建成功后弹窗会显示完整的 <code className="px-1.5 py-0.5 rounded bg-page-surface text-page-label font-mono text-xs">sk-</code> 开头的密钥，请立即复制保存，它只完整显示一次。</p>
      </Step>

      <Step n={2} title="选择调用地址（Base URL）">
        <p>创建密钥后，从下面任选一条最适合你网络的线路作为 Base URL。点击地址即可复制：</p>
        <div className="w-full -ml-11 sm:ml-0">
          <ApiEndpoints />
        </div>
        <p className="text-xs text-page-muted">
          说明：「大陆线路」适合中国大陆网络访问；「海外直链」海外网络速度更快。三条线路都调用同一套后端，价格与模型完全一致。
        </p>
      </Step>

      <Step n={3} title="通用调用示例">
        <p>OpenAI 兼容格式（把 <code className="font-mono text-xs">sk-你的密钥</code> 和 Base URL 换成你的）：</p>
        <CodeBlock
          label="curl · OpenAI 兼容"
          code={`curl https://你的Base URL/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的密钥" \\
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
        />
        <p className="mt-2">Anthropic 原生格式（Claude 官方 SDK 用户）：Base URL 直接填线路地址（不带 /v1）。</p>
      </Step>

      <Step n={4} title="接入常用工具">
        <p className="font-medium text-page">Claude Code</p>
        <p>设置两个环境变量后正常启动 <code className="font-mono text-xs">claude</code> 即可：</p>
        <CodeBlock
          code={`export ANTHROPIC_BASE_URL="https://你的Base URL"
export ANTHROPIC_AUTH_TOKEN="sk-你的密钥"`}
        />

        <p className="font-medium text-page mt-4">Cursor</p>
        <p>Settings → Models → OpenAI API Key：填入密钥，Override Base URL 填 <code className="font-mono text-xs">https://你的Base URL/v1</code>，再添加模型名（如 claude-opus-4-8）。</p>

        <p className="font-medium text-page mt-4">CC Switch</p>
        <p>新增一个配置：Base URL 填线路地址，API Key 填你的密钥，选择模型即可一键切换使用。</p>

        <p className="font-medium text-page mt-4">沉浸式翻译 / LobeChat / NextChat</p>
        <p>翻译服务或模型服务选「自定义 / OpenAI 兼容」，接口地址填 <code className="font-mono text-xs">https://你的Base URL/v1/chat/completions</code>，填入密钥即可。</p>
      </Step>

      <div className="rounded-xl border border-page-divider bg-page-surface/50 p-5 text-sm text-page-secondary">
        遇到问题？可在控制台提交工单，或查看 <Link to="/pricing" className="text-brand-500 hover:text-brand-600">定价页</Link> 了解全部模型与实时价格。
      </div>
    </div>
  );
}
