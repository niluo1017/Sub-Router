/* 灵珑AI 运营面板 v5 —— 在 subrouter.ai 登录后的任意页面运行（同源才能取数据）。
   用法：登录 subrouter.ai → 打开任意页（模型管理页可用"上架定位"）→ F12 控制台粘贴回车；
        或用「使用说明.html」里的绿色书签拖到书签栏一键点开。
   相比 v4 的改动：
   1) 完整加载 —— 全部商家(73)与全部模型(约1400+)分页拉全，不再截断在第9页。
   2) 过滤无效商家 —— 有"模型数"但服务状态列表为空(无任何在售模型)的商家一律剔除，不展示。
   3) 商家简介 —— 商家视图直接显示每家的系列/简介(description)。
   4) 模型简介 —— 模型如有简介，鼠标悬停ⓘ即可看到，商家展开列表里也直接显示。
   5) 双视图 + 更干净的 UI。只读数据，除"测首字"外不花钱、不改配置。 */
(async function () {
  document.getElementById('llops')?.remove();

  const USD_RATE = 7.2;                 // 仅用于跨币种"从低到高"排序，显示仍用原币种
  const CORE = /^(gpt-5|claude-opus|claude-sonnet|claude-fable|gpt-image-2$|gemini|grok)/;
  const uid = String((JSON.parse(localStorage.getItem('user') || '{}').id) || '');
  const H = { 'New-Api-User': uid };

  // ---------- 数据加载 ----------
  async function pageAll(base) {
    let all = [];
    for (let p = 1; p <= 40; p++) {
      const url = base + (base.includes('?') ? '&' : '?') + 'page=' + p + '&page_size=100';
      let arr = [];
      try { const r = await fetch(url).then(r => r.json()); const d = r.data || r; arr = Array.isArray(d) ? d : []; }
      catch (e) { break; }
      all = all.concat(arr);
      if (arr.length < 100) break;
    }
    return all;
  }
  async function loadGlobal() {
    try {
      const r = await fetch('/api/distributor/models/global', { headers: H }).then(r => r.json());
      const arr = r.data || r || []; const map = new Map();
      arr.forEach(g => map.set(g.model_name + '|' + g.provider_slug, g));
      return map;
    } catch (e) { return new Map(); }
  }
  async function loadMarkup() {
    try { const r = await fetch('/api/distributor/self', { headers: H }).then(r => r.json()); return (r.data || r).global_markup || 35; }
    catch (e) { return 35; }
  }

  let providers = await pageAll('/api/marketplace/providers?keyword=&sort=');
  let models = await pageAll('/api/marketplace/models');
  let gmap = await loadGlobal();
  let markup = await loadMarkup();

  // 建索引 + 过滤无效商家（无任何在售模型 = 服务状态列表为空）
  function reindex() {
    const byId = new Map();
    models.forEach(m => { if (!byId.has(m.provider_id)) byId.set(m.provider_id, []); byId.get(m.provider_id).push(m); });
    const valid = providers.filter(p => (byId.get(p.id) || []).length > 0);
    const dropped = providers.filter(p => (byId.get(p.id) || []).length === 0);
    return { byId, valid, dropped };
  }
  let { byId: modsByProv, valid: validProv, dropped: droppedProv } = reindex();
  const subSet = () => new Set([...gmap.keys()].map(k => k.split('|')[1]));  // 已订阅商家 slug
  let subs = subSet();

  // ---------- 通用工具 ----------
  const cur = c => c === 'USD' ? '$' : '¥';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; };
  const ttftOf = m => (m.median_ttft && m.median_ttft > 0) ? m.median_ttft : (m.avg_latency > 0 ? m.avg_latency : null);
  const priceTxt = m => (m.billing_mode === 'fixed' || (!m.input_price && m.fixed_price))
    ? (cur(m.price_currency) + m.fixed_price + '/次')
    : (cur(m.price_currency) + m.input_price + '/' + m.output_price);
  const costNum = m => { const v = (m.billing_mode === 'fixed' || (!m.input_price && m.fixed_price)) ? m.fixed_price : m.input_price; return (m.price_currency === 'USD' ? v * USD_RATE : v); };
  function sell(m) {
    const g = gmap.get(m.model_name + '|' + m.provider_slug);
    if (!g) return { txt: '—', none: true };
    if (g.has_custom_price) {
      const c = cur(g.custom_price_currency || g.price_currency);
      if (g.custom_fixed_price) return { txt: c + g.custom_fixed_price + '/次', custom: true, num: (g.custom_price_currency === 'USD' ? g.custom_fixed_price * USD_RATE : g.custom_fixed_price) };
      return { txt: c + g.custom_input_price + '/' + g.custom_output_price, custom: true, num: (g.custom_price_currency === 'USD' ? g.custom_input_price * USD_RATE : g.custom_input_price) };
    }
    const c = cur(g.price_currency), f = 1 + markup / 100;
    if (g.billing_mode === 'fixed' || (!g.input_price && g.fixed_price)) return { txt: c + (g.fixed_price * f).toFixed(4) + '/次', custom: false, num: (g.price_currency === 'USD' ? g.fixed_price * f * USD_RATE : g.fixed_price * f) };
    return { txt: c + (g.input_price * f).toFixed(3) + '/' + (g.output_price * f).toFixed(3), custom: false, num: (g.price_currency === 'USD' ? g.input_price * f * USD_RATE : g.input_price * f) };
  }
  const sellNum = m => { const s = sell(m); return s.none ? Infinity : s.num; };
  const shelfOf = m => { const g = gmap.get(m.model_name + '|' + m.provider_slug); return !g ? 'none' : (g.enabled ? 'on' : 'off'); };

  // 颜色化
  const cT = v => v == null || v <= 0 ? '<span style="color:#6e7681" title="样本少/统计异常">异常</span>' : '<span style="color:' + (v > 6000 ? '#f85149' : v > 3000 ? '#d29922' : '#3fb950') + '">' + (v / 1000).toFixed(1) + 's</span>';
  const cC = v => v == null || v < 0 ? '<span style="color:#6e7681">-</span>' : '<span style="color:' + (v >= 70 ? '#3fb950' : v >= 40 ? '#d29922' : '#f85149') + '">' + Math.round(v) + '%</span>';
  const cA = v => v == null || v < 0 ? '<span style="color:#6e7681">-</span>' : '<span style="color:' + (v >= 95 ? '#3fb950' : v >= 90 ? '#d29922' : '#f85149') + '">' + Math.round(v) + '%</span>';
  const cP = v => v === 100 ? '<span style="color:#3fb950">100</span>' : (v === 0 || v == null) ? '<span style="color:#6e7681">未检</span>' : '<span style="color:#f85149">' + v + '</span>';
  const stars = r => { r = +r || 0; return '<span style="color:#e3b341">★</span>' + r.toFixed(1); };
  // 推荐分：可用率60% + 评分40%(归一到百分制)；优质未订阅：高可用+高分且你还没订
  const qScore = p => 0.6 * (p.availability >= 0 ? p.availability : 0) + 0.4 * ((p.rating || 0) / 5 * 100);
  const isQualUnsub = p => !subs.has(p.slug) && p.availability >= 90 && (p.rating || 0) >= 4.0;
  function guarantee(p) {
    if (p.guarantee_level === 3) return '<span class="ll-b" style="background:rgba(138,180,255,.14);color:#8ab4ff;border:1px solid rgba(138,180,255,.35)">💎 钻石 $' + (p.guarantee_amount_usd || p.deposit_usd) + '</span>';
    if (p.guarantee_level === 2) return '<span class="ll-b" style="background:rgba(227,179,65,.14);color:#e3b341;border:1px solid rgba(227,179,65,.35)">🛡 金牌 $' + (p.guarantee_amount_usd || p.deposit_usd) + '</span>';
    if (p.deposit_usd > 0) return '<span class="ll-b" style="background:rgba(139,148,158,.14);color:#adbac7;border:1px solid #30363d">保证金 $' + p.deposit_usd + '</span>';
    return '';
  }

  // ---------- 面板骨架 ----------
  const box = document.createElement('div'); box.id = 'llops';
  box.style.cssText = 'position:fixed;top:0;right:0;width:1220px;max-width:100vw;height:100vh;overflow:hidden;background:#0d1117;border-left:1px solid #30363d;z-index:2147483647;box-shadow:-8px 0 40px rgba(0,0,0,.55);font:12px/1.55 -apple-system,"PingFang SC",sans-serif;color:#e6edf3;display:flex;flex-direction:column';
  document.body.appendChild(box);
  const style = document.createElement('style');
  style.textContent = '#llops *{box-sizing:border-box}#llops .ll-b{display:inline-block;padding:1px 7px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}#llops input,#llops select{background:#161b22;border:1px solid #30363d;border-radius:7px;color:#e6edf3;padding:5px 8px;font-size:12px;outline:none}#llops input:focus,#llops select:focus{border-color:#3b82f6}#llops button{cursor:pointer;border:0;border-radius:7px;font-size:12px;padding:6px 12px}#llops a{color:#58a6ff;text-decoration:none}#llops a:hover{text-decoration:underline}#llops .card{background:#11161d;border:1px solid #21262d;border-radius:12px;padding:13px 14px;transition:border-color .15s}#llops .card:hover{border-color:#3b82f6aa}#llops .chip{padding:4px 11px;border-radius:20px;border:1px solid #30363d;background:#161b22;color:#adbac7;cursor:pointer;font-size:12px;user-select:none}#llops .chip.on{background:#1f6feb;border-color:#1f6feb;color:#fff}#llops table{width:100%;border-collapse:collapse}#llops th{position:sticky;top:0;background:#0d1117;text-align:left;color:#8b949e;padding:7px 6px;cursor:pointer;user-select:none;white-space:nowrap;border-bottom:1px solid #30363d;font-weight:600}#llops td{padding:6px;border-bottom:1px solid #1b2027;vertical-align:top}#llops .scroll{overflow:auto;flex:1;padding:14px}#llops .scroll::-webkit-scrollbar{width:9px;height:9px}#llops .scroll::-webkit-scrollbar-thumb{background:#30363d;border-radius:6px}#llops .muted{color:#6e7681}#llops .prov-models{margin-top:10px;border-top:1px dashed #30363d;padding-top:9px;display:grid;grid-template-columns:1fr;gap:6px}';
  box.appendChild(style);

  // 视图状态
  const S = {
    view: 'prov',                     // 'prov' | 'model'
    // 商家视图
    pKw: '', pSub: 'all', pSort: 'score', pCat: 'all', pQual: false,
    // 模型视图
    model: '', kw: '', sub: 'all', shelf: 'all', cat: 'all', core: false,
    minAvail: '', minCache: '', maxTtft: '', hideZero: false, hideBad: true,
    sortKey: 'ttft', sortDir: -1,
    expanded: new Set(),
  };

  // ============ 商家视图 ============
  function providerList() {
    let list = validProv.slice();
    const kw = S.pKw.trim().toLowerCase();
    if (kw) list = list.filter(p => (p.company_name + ' ' + p.slug + ' ' + (p.description || '')).toLowerCase().includes(kw));
    if (S.pSub === 'sub') list = list.filter(p => subs.has(p.slug));
    if (S.pSub === 'unsub') list = list.filter(p => !subs.has(p.slug));
    if (S.pQual) list = list.filter(isQualUnsub);
    if (S.pCat !== 'all') list = list.filter(p => (modsByProv.get(p.id) || []).some(m => m.category === S.pCat));
    const feedCount = p => (modsByProv.get(p.id) || []).length;
    const sorters = {
      default: (a, b) => 0,
      score: (a, b) => qScore(b) - qScore(a),
      avail: (a, b) => b.availability - a.availability,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      subs: (a, b) => b.subscription_count - a.subscription_count,
      models: (a, b) => feedCount(b) - feedCount(a),
    };
    if (S.pSort !== 'default') list.sort(sorters[S.pSort]);
    return list;
  }
  function providerCard(p) {
    const ms = (modsByProv.get(p.id) || []);
    const sub = subs.has(p.slug);
    const qu = isQualUnsub(p);
    const cats = {}; ms.forEach(m => cats[m.category] = (cats[m.category] || 0) + 1);
    const catStr = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => k + ' ' + v).join(' · ');
    const logo = p.logo ? '<img src="' + esc(p.logo) + '" style="width:34px;height:34px;border-radius:9px;object-fit:cover;background:#161b22" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '';
    const initial = '<div style="width:34px;height:34px;border-radius:9px;background:#21324a;color:#8ab4ff;font-weight:700;display:' + (p.logo ? 'none' : 'flex') + ';align-items:center;justify-content:center;font-size:15px">' + esc((p.company_name || '?').trim()[0]) + '</div>';
    const exp = S.expanded.has(p.id);
    let modelsHtml = '';
    if (exp) {
      const sorted = ms.slice().sort((a, b) => (ttftOf(a) ?? 9e9) - (ttftOf(b) ?? 9e9));
      modelsHtml = '<div class="prov-models">' + sorted.map(m => {
        const sp = sell(m); const isSub = subs.has(m.provider_slug);
        const d = m.description ? '<div class="muted" style="font-size:11px;margin-top:1px">' + esc(clamp(m.description, 60)) + '</div>' : '';
        return '<div style="display:flex;gap:8px;align-items:flex-start;justify-content:space-between">'
          + '<div style="min-width:0"><span style="font-weight:600">' + esc(m.model_name) + '</span> <span class="muted" style="font-size:10px">' + esc(m.category) + '</span>' + d + '</div>'
          + '<div style="text-align:right;white-space:nowrap;flex-shrink:0"><span style="color:#adbac7">' + priceTxt(m) + '</span>　首字 ' + cT(ttftOf(m)) + '　可用 ' + cA(m.availability) + '　缓存 ' + cC(m.cache_hit_rate) + (sp.none ? '' : '　售 <span style="color:' + (sp.custom ? '#e3b341' : '#8b949e') + '">' + sp.txt + '</span>') + '</div>'
          + '</div>';
      }).join('') + '</div>';
    }
    return '<div class="card" data-pid="' + p.id + '" style="' + (qu ? 'border-color:#f0883e88;box-shadow:0 0 0 1px #f0883e33' : '') + '">'
      + '<div style="display:flex;gap:10px;align-items:flex-start">'
      + '<div style="position:relative;flex-shrink:0">' + logo + initial + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
      + '<a href="/providers/' + esc(p.slug) + '" target="_blank" style="font-weight:700;font-size:13px;color:#e6edf3">' + esc(p.company_name.trim()) + ' ↗</a>'
      + (p.verified ? '<span title="已认证" style="color:#3b82f6">✔</span>' : '')
      + guarantee(p)
      + (sub ? '<span class="ll-b" style="background:rgba(63,185,80,.14);color:#3fb950;border:1px solid rgba(63,185,80,.3)">已订阅</span>' : '')
      + (qu ? '<span class="ll-b" style="background:rgba(240,136,62,.16);color:#f0883e;border:1px solid rgba(240,136,62,.4)">🔥 优质未订阅</span>' : '')
      + '</div>'
      + '<div class="muted" style="font-size:11px">@' + esc(p.slug) + '</div>'
      + '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:5px;font-size:11px">'
      + '<span>可用率 ' + cA(p.availability) + '</span><span>' + stars(p.rating) + '</span>'
      + '<span class="muted">模型 <b style="color:#e6edf3">' + ms.length + '</b></span>'
      + '<span class="muted">订阅 ' + p.subscription_count + '</span><span class="muted">RPM ' + p.max_rpm + '</span></div>'
      + '</div></div>'
      + (p.description ? '<div style="margin-top:9px;color:#c9d1d9;font-size:11.5px">' + esc(clamp(p.description, 150)) + '</div>' : '<div class="muted" style="margin-top:9px;font-size:11px">（该商家未填写简介）</div>')
      + '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">'
      + '<span class="muted" style="font-size:10.5px">' + esc(catStr) + '</span>'
      + '<span class="ll-exp" data-pid="' + p.id + '" style="cursor:pointer;color:#58a6ff;font-size:11px">' + (exp ? '收起 ▲' : '展开 ' + ms.length + ' 个模型 ▼') + '</span>'
      + '</div>' + modelsHtml + '</div>';
  }

  // ============ 模型视图（v4 运营表增强） ============
  function modelList() {
    let list = models.slice();
    if (S.core) list = list.filter(m => CORE.test(m.model_name));
    if (S.cat !== 'all') list = list.filter(m => m.category === S.cat);
    list = list.filter(m => {
      const isSub = subs.has(m.provider_slug);
      if (S.sub === 'sub' && !isSub) return false;
      if (S.sub === 'unsub' && isSub) return false;
      if (S.shelf !== 'all') { const sh = shelfOf(m); if (S.shelf === 'on' && sh !== 'on') return false; if (S.shelf === 'off' && sh !== 'off') return false; }
      if (S.model && m.model_name !== S.model) return false;
      const kw = S.kw.trim().toLowerCase();
      if (kw && !((m.model_name + ' ' + m.provider_slug + ' ' + (m.description || '')).toLowerCase().includes(kw))) return false;
      if (S.hideZero && !m.total_requests) return false;
      const t = ttftOf(m);
      if (S.hideBad && t == null) return false;
      if (S.minAvail !== '' && (m.availability < 0 || m.availability < +S.minAvail)) return false;
      if (S.minCache !== '' && (m.cache_hit_rate == null || m.cache_hit_rate < 0 || m.cache_hit_rate < +S.minCache)) return false;
      if (S.maxTtft !== '' && (t == null || t / 1000 > +S.maxTtft)) return false;
      return true;
    });
    const sv = m => S.sortKey === 'ttft' ? ttftOf(m) : S.sortKey === 'costnum' ? costNum(m) : S.sortKey === 'sellnum' ? sellNum(m) : m[S.sortKey];
    list.sort((a, b) => { let x = sv(a), y = sv(b); if (S.sortKey === 'model_name' || S.sortKey === 'provider_slug') return (x + '').localeCompare(y + '') * S.sortDir; return ((x ?? -1) - (y ?? -1)) * S.sortDir; });
    return list;
  }
  function locate(modelName, providerName) {
    if (!location.pathname.includes('/distributor/models')) { window.open('/distributor/models', '_blank'); return; }
    const tables = document.querySelectorAll('main table');
    for (const tb of tables) {
      let el = tb, title = '';
      while (el && !title) { el = el.previousElementSibling || el.parentElement; if (!el) break; const t = (el.innerText || '').split('\n')[0].trim(); if (t && t.length < 60 && !/商家|模型管理|加价|上架列表/.test(t)) title = t; }
      if (title !== modelName) continue;
      for (const r of tb.querySelectorAll('tbody tr')) if ((r.innerText || '').includes(providerName)) {
        r.scrollIntoView({ behavior: 'smooth', block: 'center' }); const old = r.style.backgroundColor; r.style.transition = 'background .3s'; r.style.backgroundColor = 'rgba(88,166,255,.45)'; setTimeout(() => r.style.backgroundColor = old, 2600); return;
      }
    }
    alert('没在本页找到「' + modelName + ' · ' + providerName + '」。请确认当前在"模型管理"页。');
  }

  // ---------- 渲染 ----------
  const CATS = ['all', 'chat', 'image', 'video', 'embedding', 'audio'];
  function catChips(active, cb) {
    return CATS.map(c => '<span class="chip ' + (active === c ? 'on' : '') + '" data-cat="' + c + '">' + (c === 'all' ? '全部' : c) + '</span>').join('');
  }
  function header() {
    const tab = (k, l) => '<span class="chip ' + (S.view === k ? 'on' : '') + '" data-view="' + k + '" style="font-size:13px;padding:5px 16px">' + l + '</span>';
    return '<div style="padding:12px 14px;border-bottom:1px solid #21262d;display:flex;align-items:center;gap:10px;flex-shrink:0">'
      + '<b style="font-size:14px">📊 灵珑运营面板 <span class="muted" style="font-weight:400;font-size:11px">v5</span></b>'
      + tab('prov', '商家') + tab('model', '模型')
      + '<span class="muted" style="font-size:11px;margin-left:auto">有效商家 ' + validProv.length + '　模型 ' + models.length + '　已订阅 ' + subs.size + ' 家　加价 ' + markup + '%'
      + (droppedProv.length ? '　<span style="color:#d29922" title="有模型数但服务状态列表为空，已剔除：' + esc(droppedProv.map(p => p.slug).join(', ')) + '">已过滤无效 ' + droppedProv.length + '</span>' : '') + '</span>'
      + '<span id="ll-refresh" style="cursor:pointer;color:#58a6ff;font-size:12px">刷新</span>'
      + '<span id="ll-close" style="cursor:pointer;color:#8b949e;font-size:16px;padding:0 4px">✕</span></div>';
  }
  function render() {
    let h = header();
    if (S.view === 'prov') {
      const list = providerList();
      const qn = validProv.filter(isQualUnsub).length;
      h += '<div style="padding:10px 14px;border-bottom:1px solid #161b22;display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex-shrink:0">'
        + '<input id="pkw" placeholder="搜商家 / 简介" value="' + esc(S.pKw) + '" style="width:150px">'
        + '<select id="psub"><option value="all"' + (S.pSub === 'all' ? ' selected' : '') + '>全部</option><option value="sub"' + (S.pSub === 'sub' ? ' selected' : '') + '>已订阅</option><option value="unsub"' + (S.pSub === 'unsub' ? ' selected' : '') + '>未订阅</option></select>'
        + '<select id="psort"><option value="score"' + (S.pSort === 'score' ? ' selected' : '') + '>推荐分</option><option value="default"' + (S.pSort === 'default' ? ' selected' : '') + '>综合排序</option><option value="avail"' + (S.pSort === 'avail' ? ' selected' : '') + '>可用率</option><option value="rating"' + (S.pSort === 'rating' ? ' selected' : '') + '>评分</option><option value="subs"' + (S.pSort === 'subs' ? ' selected' : '') + '>订阅数</option><option value="models"' + (S.pSort === 'models' ? ' selected' : '') + '>模型数</option></select>'
        + '<span class="chip ' + (S.pQual ? 'on' : '') + '" id="pqual" style="border-color:' + (S.pQual ? '#f0883e' : '#30363d') + ';' + (S.pQual ? 'background:#f0883e;' : '') + '" title="未订阅 且 可用率≥90% 且 评分≥4.0，值得补的渠道">🔥 优质未订阅 ' + qn + '</span>'
        + catChips(S.pCat).replace(/data-cat/g, 'data-pcat')
        + '<span class="muted" style="margin-left:auto">' + list.length + ' 家</span></div>'
        + '<div class="scroll"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(372px,1fr));gap:11px;align-items:start">'
        + (list.length ? list.map(providerCard).join('') : '<div class="muted">无匹配商家</div>') + '</div></div>';
    } else {
      const list = modelList();
      const models_opt = [...new Set(models.map(m => m.model_name))].sort();
      const th = (l, k) => '<th data-k="' + k + '">' + l + (S.sortKey === k ? (S.sortDir > 0 ? ' ▲' : ' ▼') : '') + '</th>';
      h += '<div style="padding:10px 14px;border-bottom:1px solid #161b22;display:flex;flex-direction:column;gap:8px;flex-shrink:0">'
        + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
        + '模型 <select id="lm" style="max-width:180px"><option value="">全部模型</option>' + models_opt.map(x => '<option value="' + esc(x) + '"' + (S.model === x ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>'
        + '<input id="lkw" placeholder="关键词 / 简介" value="' + esc(S.kw) + '" style="width:130px">'
        + '订阅 <select id="lsub"><option value="all"' + (S.sub === 'all' ? ' selected' : '') + '>全部</option><option value="sub"' + (S.sub === 'sub' ? ' selected' : '') + '>已订阅</option><option value="unsub"' + (S.sub === 'unsub' ? ' selected' : '') + '>未订阅</option></select>'
        + '上架 <select id="lsh"><option value="all"' + (S.shelf === 'all' ? ' selected' : '') + '>全部</option><option value="on"' + (S.shelf === 'on' ? ' selected' : '') + '>已上架</option><option value="off"' + (S.shelf === 'off' ? ' selected' : '') + '>已下架</option></select>'
        + '<label style="user-select:none"><input type="checkbox" id="lcore"' + (S.core ? ' checked' : '') + '> 只看核心模型</label>'
        + '</div>'
        + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + catChips(S.cat)
        + '<span style="margin-left:8px">可用率≥<input id="la" type="number" value="' + S.minAvail + '" style="width:48px">%　缓存≥<input id="lc" type="number" value="' + S.minCache + '" style="width:48px">%　首字≤<input id="lt" type="number" value="' + S.maxTtft + '" style="width:48px">s</span>'
        + '<label><input type="checkbox" id="lz"' + (S.hideZero ? ' checked' : '') + '> 隐藏0调用</label>'
        + '<label><input type="checkbox" id="lb"' + (S.hideBad ? ' checked' : '') + '> 隐藏异常首字</label>'
        + '<span class="muted" style="margin-left:auto">' + list.length + ' / ' + models.length + ' 渠道</span></div></div>'
        + '<div class="scroll"><table><thead><tr>' + th('模型', 'model_name') + '<th>简介</th>' + th('商家', 'provider_slug') + '<th>订阅</th>' + th('商家成本', 'costnum') + th('分站售价', 'sellnum') + '<th>上架</th>' + th('首字', 'ttft') + th('缓存', 'cache_hit_rate') + th('可用率', 'availability') + th('探测', 'probe_score') + th('调用量', 'total_requests') + '</tr></thead><tbody>';
      let prev = null, band = 0;
      for (const m of list) {
        if (m.model_name !== prev) { band ^= 1; prev = m.model_name; }
        const isSub = subs.has(m.provider_slug);
        const sp = sell(m); const sh = shelfOf(m);
        const di = m.description ? '<span title="' + esc(m.description) + '" style="cursor:help;color:#8b949e">' + esc(clamp(m.description, 22)) + '</span>' : '<span class="muted">-</span>';
        const spCell = sp.none ? '<span class="muted">—</span>' : '<span style="color:' + (sp.custom ? '#e3b341' : '#adbac7') + '">' + sp.txt + (sp.custom ? ' <span style="font-size:10px">手动</span>' : '') + '</span>';
        const shCell = sh === 'none' ? '<span class="muted">—</span>' : '<span class="llsh" data-m="' + esc(m.model_name) + '" data-pn="' + esc(m.provider_name || m.provider_slug) + '" style="cursor:pointer;text-decoration:underline dotted">' + (sh === 'on' ? '<span style="color:#3fb950">✓上架</span>' : '<span style="color:#f85149">✗下架</span>') + '</span>';
        h += '<tr style="' + (band ? 'background:rgba(120,170,255,.05)' : '') + '"><td style="font-weight:600">' + esc(m.model_name) + '<div class="muted" style="font-size:10px">' + esc(m.category) + '</div></td><td style="max-width:150px">' + di + '</td><td><a href="/providers/' + esc(m.provider_slug) + '" target="_blank">' + esc(m.provider_slug) + ' ↗</a></td><td style="text-align:center">' + (isSub ? '<span style="color:#3fb950">✓</span>' : '<span class="muted">—</span>') + '</td><td>' + priceTxt(m) + '</td><td>' + spCell + '</td><td>' + shCell + '</td><td>' + cT(ttftOf(m)) + '</td><td>' + cC(m.cache_hit_rate) + '</td><td>' + cA(m.availability) + '</td><td>' + cP(m.probe_score) + '</td><td class="muted">' + (m.total_requests || 0) + '</td></tr>';
      }
      h += '</tbody></table></div>';
    }
    box.innerHTML = ''; box.appendChild(style);
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;height:100%'; wrap.innerHTML = h; box.appendChild(wrap);
    bind();
  }

  function bind() {
    const q = s => box.querySelector(s), qa = s => box.querySelectorAll(s);
    q('#ll-close').onclick = () => box.remove();
    q('#ll-refresh').onclick = async () => { q('#ll-refresh').textContent = '刷新中…'; providers = await pageAll('/api/marketplace/providers?keyword=&sort='); models = await pageAll('/api/marketplace/models'); gmap = await loadGlobal(); markup = await loadMarkup(); ({ byId: modsByProv, valid: validProv, dropped: droppedProv } = reindex()); subs = subSet(); render(); };
    qa('[data-view]').forEach(e => e.onclick = () => { S.view = e.dataset.view; render(); });
    const keepFocus = (id, key) => { const el = q(id); if (!el) return; el.oninput = e => { S[key] = e.target.value; const p = e.target.selectionStart; render(); const n = q(id); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) {} } }; };
    if (S.view === 'prov') {
      keepFocus('#pkw', 'pKw');
      q('#psub').onchange = e => { S.pSub = e.target.value; render(); };
      q('#psort').onchange = e => { S.pSort = e.target.value; render(); };
      qa('[data-pcat]').forEach(e => e.onclick = () => { S.pCat = e.dataset.pcat; render(); });
      { const pq = q('#pqual'); if (pq) pq.onclick = () => { S.pQual = !S.pQual; render(); }; }
      qa('.ll-exp').forEach(e => e.onclick = ev => { ev.stopPropagation(); const id = +e.dataset.pid; S.expanded.has(id) ? S.expanded.delete(id) : S.expanded.add(id); render(); });
    } else {
      q('#lm').onchange = e => { S.model = e.target.value; if (S.model) { S.sortKey = 'sellnum'; S.sortDir = 1; } render(); };
      keepFocus('#lkw', 'kw'); keepFocus('#la', 'minAvail'); keepFocus('#lc', 'minCache'); keepFocus('#lt', 'maxTtft');
      q('#lsub').onchange = e => { S.sub = e.target.value; render(); };
      q('#lsh').onchange = e => { S.shelf = e.target.value; render(); };
      q('#lcore').onchange = e => { S.core = e.target.checked; render(); };
      q('#lz').onchange = e => { S.hideZero = e.target.checked; render(); };
      q('#lb').onchange = e => { S.hideBad = e.target.checked; render(); };
      qa('[data-cat]').forEach(e => e.onclick = () => { S.cat = e.dataset.cat; render(); });
      qa('th[data-k]').forEach(t => t.onclick = () => { const k = t.dataset.k; if (S.sortKey === k) S.sortDir *= -1; else { S.sortKey = k; S.sortDir = (k === 'model_name' || k === 'provider_slug' || k === 'costnum' || k === 'sellnum') ? 1 : -1; } render(); });
      qa('.llsh').forEach(s => s.onclick = () => locate(s.dataset.m, s.dataset.pn));
    }
  }
  render();
})();
