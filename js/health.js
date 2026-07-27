/* ===== 健康模块：体重 / 体态打卡 / 身体数据 / 改善项目 ===== */
const Health = {
  tab: 'weight',

  render() {
    const el = document.getElementById('page-health');
    el.innerHTML = `
      <div class="seg">
        <button class="${this.tab==='weight'?'active':''}" onclick="Health.switch('weight')">⚖️ 体重</button>
        <button class="${this.tab==='habit'?'active':''}" onclick="Health.switch('habit')">🧘 体态打卡</button>
        <button class="${this.tab==='body'?'active':''}" onclick="Health.switch('body')">📏 身体数据</button>
      </div>
      <div id="healthBody">${this[this.tab + 'HTML']()}</div>`;
  },

  switch(t) { this.tab = t; this.render(); },

  /* ---------- 体重 ---------- */
  weightHTML() {
    const h = Store.data.health;
    const ws = [...h.weights].sort((a, b) => a.date < b.date ? -1 : 1);
    const latest = ws[ws.length - 1];
    const first = ws[0];
    const lost = (first && latest) ? (first.kg - latest.kg).toFixed(1) : null;
    const target = h.targetWeight;
    return `
      <div class="grid2">
        <div class="card"><div class="card-title">当前体重</div>
          <div class="stat-num">${latest ? latest.kg : '--'}<small>kg</small></div>
          <div class="stat-sub">${latest ? latest.date : '尚未记录'}</div></div>
        <div class="card"><div class="card-title">累计减重</div>
          <div class="stat-num" style="color:${lost > 0 ? 'var(--primary)' : 'var(--text)'}">${lost != null ? lost : '--'}<small>kg</small></div>
          <div class="stat-sub">目标 ${target ? target + ' kg' : '未设置'} <span class="more" onclick="Health.setTarget()">设置</span></div></div>
      </div>
      <div class="card">
        <div class="card-title">体重趋势（近 30 次）</div>
        <div class="chart-wrap">${this.weightChart(ws.slice(-30), target)}</div>
      </div>
      <button class="btn" onclick="Health.addWeight()">＋ 记录今日体重</button>
      <div class="card mt12">
        <div class="card-title">历史记录</div>
        ${ws.length ? [...ws].reverse().slice(0, 10).map(w => `
          <div class="list-item">
            <div class="li-main"><div class="li-title">${w.kg} kg</div><div class="li-sub">${w.date}</div></div>
            <button class="plan-del" onclick="Health.delWeight('${w.date}')">✕</button>
          </div>`).join('') : '<div class="empty"><span class="emoji">⚖️</span>记录第一次体重，开始追踪吧</div>'}
      </div>`;
  },

  weightChart(ws, target) {
    if (ws.length < 2) return '<div class="empty">至少记录 2 次后显示趋势图</div>';
    const W = 320, H = 150, P = 26;
    let vals = ws.map(w => w.kg);
    if (target) vals = vals.concat([target]);
    const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
    const x = i => P + i * (W - P * 2) / (ws.length - 1);
    const y = v => H - P - (v - min) * (H - P * 2) / (max - min);
    const pts = ws.map((w, i) => `${x(i)},${y(w.kg)}`).join(' ');
    const tl = target ? `<line x1="${P}" y1="${y(target)}" x2="${W-P}" y2="${y(target)}" stroke="#f59e0b" stroke-dasharray="4 3" stroke-width="1.5"/>
      <text x="${W-P}" y="${y(target)-5}" text-anchor="end" font-size="10" fill="#b45309">目标 ${target}</text>` : '';
    return `<svg viewBox="0 0 ${W} ${H}">
      <polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${ws.map((w, i) => `<circle cx="${x(i)}" cy="${y(w.kg)}" r="3" fill="#fff" stroke="var(--primary)" stroke-width="2"/>`).join('')}
      ${tl}
      <text x="${x(0)}" y="${H-6}" font-size="9" fill="#9aa4b0">${ws[0].date.slice(5)}</text>
      <text x="${x(ws.length-1)}" y="${H-6}" text-anchor="end" font-size="9" fill="#9aa4b0">${ws[ws.length-1].date.slice(5)}</text>
      <text x="${x(ws.length-1)}" y="${y(ws[ws.length-1].kg)-8}" text-anchor="end" font-size="11" font-weight="700" fill="var(--primary-dark)">${ws[ws.length-1].kg}</text>
    </svg>`;
  },

  addWeight() {
    UI.modal(`
      <h3>记录体重</h3>
      <div class="field"><label>日期</label><input type="date" id="wDate" value="${Util.today()}"></div>
      <div class="field"><label>体重 (kg)</label><input type="number" step="0.1" inputmode="decimal" id="wKg" placeholder="如 62.5"></div>
      <button class="btn" onclick="Health.saveWeight()">保存</button>`);
  },

  saveWeight() {
    const date = document.getElementById('wDate').value;
    const kg = parseFloat(document.getElementById('wKg').value);
    if (!date || !kg || kg < 20 || kg > 300) return UI.toast('请输入有效体重');
    const arr = Store.data.health.weights;
    const i = arr.findIndex(w => w.date === date);
    if (i >= 0) arr[i].kg = kg; else arr.push({ date, kg });
    Store.save(); UI.closeModal(); this.render(); Today.render();
    UI.toast('已记录 ✓');
  },

  delWeight(date) {
    Store.data.health.weights = Store.data.health.weights.filter(w => w.date !== date);
    Store.save(); this.render(); Today.render();
  },

  setTarget() {
    UI.modal(`
      <h3>目标体重</h3>
      <div class="field"><input type="number" step="0.1" inputmode="decimal" id="tKg" value="${Store.data.health.targetWeight || ''}" placeholder="如 58"></div>
      <button class="btn" onclick="Health.saveTarget()">保存</button>`);
  },

  saveTarget() {
    const v = parseFloat(document.getElementById('tKg').value);
    Store.data.health.targetWeight = v || null;
    Store.save(); UI.closeModal(); this.render();
  },

  /* ---------- 体态打卡 ---------- */
  streak(habit) {
    let n = 0, d = Util.today();
    if (!habit.log[d]) d = Util.addDays(d, -1); // 今天没打不断连
    while (habit.log[d]) { n++; d = Util.addDays(d, -1); }
    return n;
  },

  habitHTML() {
    const h = Store.data.health;
    const today = Util.today();
    return `
      <div class="card">
        <div class="card-title">今日体态训练 <span class="more" onclick="Health.addHabit()">＋ 添加项目</span></div>
        ${h.habits.length ? h.habits.map(hb => {
          const done = !!hb.log[today];
          const st = this.streak(hb);
          return `<div class="habit-row">
            <div class="habit-check ${done ? 'done' : ''}" onclick="Health.toggleHabit('${hb.id}')">${done ? '✓' : ''}</div>
            <div class="habit-name">${Util.esc(hb.name)}</div>
            ${st > 0 ? `<div class="habit-streak">🔥 ${st}天</div>` : ''}
            <button class="plan-del" onclick="Health.delHabit('${hb.id}')">✕</button>
          </div>`;
        }).join('') : '<div class="empty"><span class="emoji">🧘</span>添加你的体态训练项目</div>'}
      </div>
      <div class="card">
        <div class="card-title">待改善项目 <span class="more" onclick="Health.addIssue()">＋ 添加</span></div>
        ${h.issues.length ? h.issues.map(it => `
          <div class="habit-row">
            <div class="habit-check ${it.done ? 'done' : ''}" onclick="Health.toggleIssue('${it.id}')">${it.done ? '✓' : ''}</div>
            <div class="habit-name" style="${it.done ? 'text-decoration:line-through;color:var(--text-3)' : ''}">${Util.esc(it.name)}</div>
            <button class="plan-del" onclick="Health.delIssue('${it.id}')">✕</button>
          </div>`).join('') : '<div class="empty">暂无</div>'}
        <p class="muted mt8">记录你想改善的体态问题（如圆肩、骨盆前倾），改善达标后打勾。</p>
      </div>`;
  },

  toggleHabit(id) {
    const hb = Store.data.health.habits.find(x => x.id === id);
    const t = Util.today();
    if (hb.log[t]) delete hb.log[t]; else hb.log[t] = 1;
    Store.save(); this.render(); Today.render();
  },

  addHabit() {
    UI.modal(`
      <h3>添加训练项目</h3>
      <div class="field"><input id="hbName" placeholder="如：靠墙天使 3 组"></div>
      <button class="btn" onclick="Health.saveHabit()">添加</button>`);
  },

  saveHabit() {
    const v = document.getElementById('hbName').value.trim();
    if (!v) return;
    Store.data.health.habits.push({ id: Util.uid(), name: v, log: {} });
    Store.save(); UI.closeModal(); this.render();
  },

  delHabit(id) {
    UI.confirm('删除该训练项目及其打卡记录？', () => {
      Store.data.health.habits = Store.data.health.habits.filter(x => x.id !== id);
      Store.save(); this.render(); Today.render();
    });
  },

  toggleIssue(id) {
    const it = Store.data.health.issues.find(x => x.id === id);
    it.done = !it.done;
    Store.save(); this.render();
  },

  addIssue() {
    UI.modal(`
      <h3>添加待改善项目</h3>
      <div class="field"><input id="isName" placeholder="如：骨盆前倾"></div>
      <button class="btn" onclick="Health.saveIssue()">添加</button>`);
  },

  saveIssue() {
    const v = document.getElementById('isName').value.trim();
    if (!v) return;
    Store.data.health.issues.push({ id: Util.uid(), name: v, done: false });
    Store.save(); UI.closeModal(); this.render();
  },

  delIssue(id) {
    Store.data.health.issues = Store.data.health.issues.filter(x => x.id !== id);
    Store.save(); this.render();
  },

  /* ---------- 身体数据 ---------- */
  bodyHTML() {
    const list = [...Store.data.health.body].sort((a, b) => a.date < b.date ? 1 : -1);
    return `
      <button class="btn" onclick="Health.addBody()">＋ 记录身体数据</button>
      <div class="card mt12">
        <div class="card-title">测量记录</div>
        ${list.length ? list.map((b, i) => `
          <div class="list-item">
            <div class="li-main">
              <div class="li-title">${[b.waist ? '腰围 ' + b.waist : '', b.hip ? '臀围 ' + b.hip : '', b.bodyfat ? '体脂 ' + b.bodyfat + '%' : ''].filter(Boolean).join(' · ') || '—'}</div>
              <div class="li-sub">${b.date}${b.note ? ' · ' + Util.esc(b.note) : ''}</div>
            </div>
            <button class="plan-del" onclick="Health.delBody(${i})">✕</button>
          </div>`).join('') : '<div class="empty"><span class="emoji">📏</span>记录腰围、体脂率等，配合体重看变化</div>'}
      </div>`;
  },

  addBody() {
    UI.modal(`
      <h3>身体数据</h3>
      <div class="field"><label>日期</label><input type="date" id="bDate" value="${Util.today()}"></div>
      <div class="row">
        <div class="field"><label>腰围 (cm)</label><input type="number" inputmode="decimal" id="bWaist"></div>
        <div class="field"><label>臀围 (cm)</label><input type="number" inputmode="decimal" id="bHip"></div>
      </div>
      <div class="field"><label>体脂率 (%)</label><input type="number" inputmode="decimal" id="bFat"></div>
      <div class="field"><label>备注</label><input id="bNote" placeholder="选填"></div>
      <button class="btn" onclick="Health.saveBody()">保存</button>`);
  },

  saveBody() {
    const b = {
      date: document.getElementById('bDate').value,
      waist: parseFloat(document.getElementById('bWaist').value) || null,
      hip: parseFloat(document.getElementById('bHip').value) || null,
      bodyfat: parseFloat(document.getElementById('bFat').value) || null,
      note: document.getElementById('bNote').value.trim()
    };
    if (!b.date || (!b.waist && !b.hip && !b.bodyfat && !b.note)) return UI.toast('请至少填一项');
    Store.data.health.body.push(b);
    Store.save(); UI.closeModal(); this.render();
    UI.toast('已记录 ✓');
  },

  delBody(i) {
    const sorted = [...Store.data.health.body].sort((a, b) => a.date < b.date ? 1 : -1);
    const target = sorted[i];
    Store.data.health.body = Store.data.health.body.filter(x => x !== target);
    Store.save(); this.render();
  }
};
