import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTokens, getSiteModels } from '../api';
import toast from 'react-hot-toast';

const ConfigExporter = () => {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTool, setSelectedTool] = useState('claudecode');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const serverAddress = window.location.origin;

  const tools = [
    { id: 'claudecode', name: 'Claude Code', path: '~/.claude/settings.json' },
    { id: 'openclaw', name: 'OpenClaw', path: '~/.openclaw/openclaw.json' },
    { id: 'opencode', name: 'OpenCode', path: '~/.config/opencode/opencode.json' },
    { id: 'cursor', name: 'Cursor', path: 'Settings → Models → OpenAI API Key' },
    { id: 'curl', name: 'cURL', path: 'Terminal' },
    { id: 'python', name: 'Python SDK', path: 'main.py' },
    { id: 'anthropic', name: 'Anthropic SDK', path: 'main.py' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedToken) {
      loadModelsForToken(selectedToken);
    }
  }, [selectedToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTokens();
      if (res.data.success) {
        const tokenList = res.data.data || [];
        setTokens(tokenList);
        if (tokenList.length > 0) {
          setSelectedToken(tokenList[0]);
        }
      }
    } catch (e) { /* interceptor */ }
    setLoading(false);
  };

  const loadModelsForToken = async (token) => {
    try {
      // Try token-specific model limits first
      if (token.model_limits_enabled && token.model_limits) {
        const models = token.model_limits.split(',').filter(m => m.trim());
        setAvailableModels(models);
        if (models.length > 0) setSelectedModel(models[0]);
        return;
      }
      // Fall back to site-wide model list
      const res = await getSiteModels();
      if (res.data.success && res.data.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
        const modelNames = list.map(m => m.model_name || m.id || m);
        setAvailableModels(modelNames);
        if (modelNames.length > 0) setSelectedModel(modelNames[0]);
      }
    } catch (e) { /* silent */ }
  };

  const getProviderInfo = (modelName) => {
    const lower = modelName.toLowerCase();
    if (lower.includes('claude')) return { provider: 'anthropic', api: 'anthropic-messages' };
    if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3')) return { provider: 'openai', api: 'openai-chat' };
    if (lower.includes('gemini')) return { provider: 'google', api: 'google-chat' };
    return { provider: 'openai', api: 'openai-chat' };
  };

  const generateConfig = () => {
    if (!selectedToken || !selectedModel) return '';
    const apiKey = 'sk-' + selectedToken.key;

    switch (selectedTool) {
      case 'claudecode':
        return `{
  "env": {
    "ANTHROPIC_API_KEY": "${apiKey}",
    "ANTHROPIC_BASE_URL": "${serverAddress}/",
    "ANTHROPIC_MODEL": "${selectedModel}"
  }
}`;
      case 'openclaw': {
        const info = getProviderInfo(selectedModel);
        return `{
  "provider": "${info.provider}",
  "base_url": "${serverAddress}/",
  "api": "${info.api}",
  "api_key": "${apiKey}",
  "model": {
    "id": "${selectedModel}",
    "name": "${selectedModel}"
  }
}`;
      }
      case 'opencode':
        return `{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "${serverAddress}/v1",
        "apiKey": "${apiKey}"
      },
      "models": {
        "${selectedModel}": {
          "name": "${selectedModel}",
          "options": {
            "store": false
          }
        }
      }
    }
  },
  "$schema": "https://opencode.ai/config.json"
}`;
      case 'cursor':
        return `API Key: ${apiKey}
Base URL: ${serverAddress}/v1
Model: ${selectedModel}`;
      case 'curl':
        return `curl ${serverAddress}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`;
      case 'python':
        return `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${serverAddress}/v1"
)

response = client.chat.completions.create(
    model="${selectedModel}",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`;
      case 'anthropic':
        return `import anthropic

client = anthropic.Anthropic(
    api_key="${apiKey}",
    base_url="${serverAddress}/"
)

message = client.messages.create(
    model="${selectedModel}",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(message.content[0].text)`;
      default:
        return '';
    }
  };

  const getFilename = () => {
    switch (selectedTool) {
      case 'curl': return 'api-call.sh';
      case 'python': return 'main.py';
      case 'anthropic': return 'main.py';
      case 'cursor': return 'cursor-config.txt';
      default: return tools.find(t => t.id === selectedTool)?.path.split('/').pop() || 'config.json';
    }
  };

  const handleCopy = async () => {
    const config = generateConfig();
    try {
      await navigator.clipboard.writeText(config);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = config;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success(t('config.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const config = generateConfig();
    const filename = getFilename();
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('config.downloaded'));
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-page-secondary">{t('config.loading')}</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <svg className="w-8 h-8 mx-auto mb-3 text-page-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <p className="text-sm text-page-secondary mb-1">{t('config.loginPrompt')}</p>
        <p className="text-xs text-page-muted">{t('config.loginDesc')}</p>
      </div>
    );
  }

  const config = generateConfig();

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <h4 className="font-semibold text-sm text-page flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('config.title')}
        </h4>
        <p className="text-xs text-page-muted mt-1">{t('config.subtitle')}</p>
      </div>

      {/* Controls */}
      <div className="p-5 space-y-4">
        {/* API Key Selection */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-page-label mb-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            {t('config.selectKey')}
          </label>
          <select
            value={selectedToken?.id || ''}
            onChange={(e) => {
              const token = tokens.find(t => t.id === parseInt(e.target.value));
              setSelectedToken(token);
            }}
            className="input"
          >
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name} (sk-{token.key.substring(0, 16)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        {availableModels.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-page-label mb-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {t('config.selectModel')}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tool Selection */}
        <div>
          <label className="text-xs font-medium text-page-label mb-2 block">{t('config.selectTool')}</label>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTool === tool.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white/5 text-page-secondary hover:bg-white/10'
                }`}
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Config Preview */}
      <div className="border-t border-white/5">
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-page-muted ml-1">
              {tools.find(t => t.id === selectedTool)?.path}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-page-muted hover:text-page"
              title={t('config.copy')}
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-page-muted hover:text-page"
              title={t('config.download')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-64 font-mono text-green-400">
          <code>{config}</code>
        </pre>
      </div>
    </div>
  );
};

export default ConfigExporter;
