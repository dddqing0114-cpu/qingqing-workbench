/* ===== 本地数据存储层（localStorage） ===== */
const Store = {
  KEY: 'doctor-workbench-v1',
  data: null,

  defaults() {
    return {
      profile: { name: '筱', hospital: '', signature: '', avatar: null },
      schedule: {
        // 'YYYY-MM-DD': '班次名'
        shifts: {},
        lastImport: null
      },
      health: {
        weights: [],        // {date:'YYYY-MM-DD', kg: 62.5}
        targetWeight: null,
        habits: [
          { id: 'h1', name: '靠墙站 5 分钟', log: {} },
          { id: 'h2', name: '颈部拉伸', log: {} },
          { id: 'h3', name: '肩背激活训练', log: {} }
        ],
        body: [],           // {date, waist, hip, bodyfat, note}
        issues: [
          { id: 'i1', name: '圆肩驼背', done: false },
          { id: 'i2', name: '头前引', done: false }
        ]
      },
      words: {
        // 每个单词的学习状态: { idx: {level: 0-5, next: 'YYYY-MM-DD', seen: n} }
        progress: {},
        dailyGoal: 20,
        log: {},            // 'YYYY-MM-DD': 学习个数
        phraseFam: {}       // 高频词组熟悉标记: { idx: true }
      },
      plans: {},           // 'YYYY-MM-DD': [{id, text, done}]
      fridge: {
        fresh: [],          // 冷藏食材: [{id, name, qty}]
        frozen: []          // 冷冻食材: [{id, name, qty}]
      }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this.data = raw ? Object.assign(this.defaults(), JSON.parse(raw)) : this.defaults();
    } catch (e) {
      this.data = this.defaults();
    }
    // 兼容旧备份：移除已删除的「心情」模块数据，保持存储干净
    if (this.data && this.data.mood) delete this.data.mood;
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
    } catch (e) {
      UI.toast('存储失败：空间不足');
    }
  },

  export() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '工作台备份-' + Util.today() + '.json';
    a.click();
  },

  // 导出为可复制文本（iOS 主屏下 download 可能被拦，复制/分享更可靠）
  exportModal() {
    const json = JSON.stringify(this.data, null, 2);
    UI.modal(`
      <h3>导出数据备份</h3>
      <p class="muted">复制下面的文本保存（备忘录 / 微信文件传输助手 / 「文件」App 均可）。换手机或清空浏览器后，粘贴回来即可恢复，原有数据不丢。</p>
      <textarea class="bk-text" readonly onclick="this.select()">${Util.esc(json)}</textarea>
      <button class="btn" onclick="Store.copyBackup()">📋 复制文本</button>
      <button class="btn ghost mt8" onclick="Store.shareBackup()">📤 分享为文件</button>
      <button class="btn ghost mt8" onclick="UI.closeModal()">关闭</button>`);
  },

  copyBackup() {
    const ta = document.querySelector('.bk-text');
    const done = () => UI.toast('已复制 ✓');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(done).catch(() => { ta.select(); document.execCommand('copy'); done(); });
    } else { ta.select(); document.execCommand('copy'); done(); }
  },

  shareBackup() {
    const json = JSON.stringify(this.data, null, 2);
    try {
      const file = new File([json], '工作台备份-' + Util.today() + '.json', { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: '工作台备份' }).catch(() => {});
      } else if (navigator.share) {
        navigator.share({ title: '工作台备份', text: json }).catch(() => {});
      } else { UI.toast('当前环境不支持分享，请复制文本'); }
    } catch (e) { UI.toast('当前环境不支持分享，请复制文本'); }
  },

  import(json) {
    const inc = JSON.parse(json);
    this.data = this._merge(this.defaults(), this.data, inc);
    this.save();
  },

  // 深度合并：恢复备份时「两边数据都保留」，不互相覆盖
  _merge(base, cur, inc) {
    const out = Array.isArray(inc) ? [] : {};
    const keys = new Set([...Object.keys(cur || {}), ...Object.keys(inc || {})]);
    for (const k of keys) {
      const cv = cur ? cur[k] : undefined, iv = inc ? inc[k] : undefined;
      if (Array.isArray(cv) || Array.isArray(iv)) {
        const arr = [...(cv || []), ...(iv || [])];
        out[k] = [...new Set(arr.map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
      } else if (cv && typeof cv === 'object' && iv && typeof iv === 'object') {
        out[k] = this._merge({}, cv, iv);
      } else {
        out[k] = iv !== undefined ? iv : cv;
      }
    }
    return out;
  }
};

/* ===== 工具函数 ===== */
const Util = {
  today() { return this.fmt(new Date()); },
  fmt(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },
  addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return this.fmt(d);
  },
  weekCN(dateStr) {
    return '日一二三四五六'[new Date(dateStr + 'T00:00:00').getDay()];
  },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
  // 班次显示美化：下夜 / 下补 / 补休 统一显示为「休」
  shiftLabel(s) {
    if (!s) return s;
    if (/下夜|下补|补休/.test(s)) return '休';
    return s;
  },
  // 班次类型 → 颜色类别：休=绿、白班=粉、夜班=橘、读片=红（其余默认主色）
  shiftKind(s) {
    if (!s) return '';
    if (/休|下夜|下补/.test(s)) return 'rest';
    if (/夜/.test(s)) return 'night';
    if (/读片|读/.test(s)) return 'read';
    if (/白班/.test(s)) return 'day';
    if (/急诊|副班/.test(s)) return 'redborder';
    return '';
  }
};
