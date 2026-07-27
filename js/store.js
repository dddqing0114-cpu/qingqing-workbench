/* ===== 本地数据存储层（localStorage） ===== */
const Store = {
  KEY: 'doctor-workbench-v1',
  data: null,

  defaults() {
    return {
      profile: { name: '筱', hospital: '' },
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
        log: {}             // 'YYYY-MM-DD': 学习个数
      },
      plans: {}            // 'YYYY-MM-DD': [{id, text, done}]
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
  // 班次显示美化：补休=休息，日历上更直观
  shiftLabel(s) {
    if (!s) return s;
    if (/补休/.test(s)) return '休';
    return s;
  }
};
