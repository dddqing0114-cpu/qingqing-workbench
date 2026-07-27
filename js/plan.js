/* ===== 每日计划模块 ===== */
const Plan = {
  date: null,

  init() { this.date = Util.today(); },

  list(d) { return Store.data.plans[d] || []; },

  render() {
    const el = document.getElementById('page-plan');
    const d = this.date;
    const items = this.list(d);
    const done = items.filter(i => i.done).length;
    el.innerHTML = `
      <div class="card">
        <div class="cal-head">
          <div class="cal-month">${d === Util.today() ? '今天' : d}（周${Util.weekCN(d)}）</div>
          <div class="cal-nav">
            <button onclick="Plan.nav(-1)">‹</button>
            <button onclick="Plan.nav(0)">今</button>
            <button onclick="Plan.nav(1)">›</button>
          </div>
        </div>
        ${items.length ? `<p class="muted" style="margin-bottom:6px">完成 ${done}/${items.length}</p>` : ''}
        ${items.length ? items.map(it => `
          <div class="plan-item ${it.done ? 'done' : ''}">
            <div class="habit-check ${it.done ? 'done' : ''}" onclick="Plan.toggle('${it.id}')">${it.done ? '✓' : ''}</div>
            <div class="li-main"><div class="li-title">${Util.esc(it.text)}</div></div>
            <button class="plan-del" onclick="Plan.del('${it.id}')">✕</button>
          </div>`).join('') : '<div class="empty"><span class="emoji">📝</span>这一天还没有计划</div>'}
      </div>
      <div class="card">
        <div class="field"><input id="planInput" placeholder="添加计划，如：审 20 份 CT 报告" onkeydown="if(event.key==='Enter')Plan.add()"></div>
        <button class="btn" onclick="Plan.add()">＋ 添加</button>
      </div>
      <div class="card">
        <div class="card-title">常用快捷添加</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${['背单词 20 个', '体态训练', '记录体重', '阅读文献', '复盘疑难病例'].map(t =>
            `<button class="btn ghost small" onclick="Plan.quick('${t}')">${t}</button>`).join('')}
        </div>
      </div>`;
  },

  nav(dir) {
    this.date = dir === 0 ? Util.today() : Util.addDays(this.date, dir);
    this.render();
  },

  add() {
    const input = document.getElementById('planInput');
    const v = input.value.trim();
    if (!v) return;
    if (!Store.data.plans[this.date]) Store.data.plans[this.date] = [];
    Store.data.plans[this.date].push({ id: Util.uid(), text: v, done: false });
    Store.save(); this.render(); Today.render();
  },

  quick(text) {
    if (!Store.data.plans[this.date]) Store.data.plans[this.date] = [];
    Store.data.plans[this.date].push({ id: Util.uid(), text, done: false });
    Store.save(); this.render(); Today.render();
    UI.toast('已添加 ✓');
  },

  toggle(id) {
    const it = this.list(this.date).find(x => x.id === id);
    if (it) { it.done = !it.done; Store.save(); this.render(); Today.render(); }
  },

  del(id) {
    Store.data.plans[this.date] = this.list(this.date).filter(x => x.id !== id);
    Store.save(); this.render(); Today.render();
  }
};
