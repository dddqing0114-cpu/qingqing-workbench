/* ===== 单词模块：卡片学习 + 简化间隔复习 ===== */
const Words = {
  queue: [],        // 本轮学习队列（词库下标）
  cur: null,        // 当前下标
  revealed: false,

  // 间隔天数表：等级0=新词，答对升级，答错降级
  INTERVALS: [0, 1, 2, 4, 7, 15],

  stats() {
    const p = Store.data.words.progress;
    const total = WORDS_DATA.length;
    let learned = 0, mastered = 0, due = 0;
    const today = Util.today();
    for (let i = 0; i < total; i++) {
      const st = p[i];
      if (st && st.seen > 0) learned++;
      if (st && st.level >= 5) mastered++;
      if (st && st.seen > 0 && st.level < 5 && st.next <= today) due++;
    }
    return { total, learned, mastered, due, todayCount: Store.data.words.log[today] || 0 };
  },

  buildQueue() {
    const p = Store.data.words.progress;
    const today = Util.today();
    const due = [], fresh = [];
    for (let i = 0; i < WORDS_DATA.length; i++) {
      const st = p[i];
      if (st && st.seen > 0) {
        if (st.level < 5 && st.next <= today) due.push(i);
      } else {
        fresh.push(i);
      }
    }
    const goal = Store.data.words.dailyGoal;
    // 先复习到期的，再学新词
    this.queue = due.concat(fresh.slice(0, Math.max(goal - due.length, 5)));
  },

  render() {
    const el = document.getElementById('page-words');
    const s = this.stats();
    if (this.cur == null) {
      el.innerHTML = `
        <div class="grid2">
          <div class="card"><div class="card-title">已学 / 总词数</div>
            <div class="stat-num">${s.learned}<small>/ ${s.total}</small></div>
            <div class="progress-bar"><i style="width:${(s.learned / s.total * 100).toFixed(1)}%"></i></div></div>
          <div class="card"><div class="card-title">已掌握</div>
            <div class="stat-num" style="color:var(--primary)">${s.mastered}</div>
            <div class="stat-sub">连续答对 5 级后视为掌握</div></div>
        </div>
        <div class="card">
          <div class="card-title">今日任务</div>
          <div style="font-size:15px;line-height:1.8">
            📌 待复习：<b style="color:var(--orange)">${s.due}</b> 个<br>
            ✅ 今天已学：<b style="color:var(--primary)">${s.todayCount}</b> 个（目标 ${Store.data.words.dailyGoal} 个 <span class="more" onclick="Words.setGoal()">修改</span>）
          </div>
        </div>
        <button class="btn" onclick="Words.start()">🚀 开始背单词</button>
        <p class="muted center mt12">词库：同等学力申硕英语核心词汇 · 共 ${s.total} 词<br>之后可以随时让我扩充词库或导入你自己的词表</p>`;
      return;
    }

    const w = WORDS_DATA[this.cur];
    const left = this.queue.length;
    el.innerHTML = `
      <div class="muted center" style="margin-bottom:10px">本轮剩余 ${left + 1} 个 · 今日已学 ${s.todayCount}</div>
      <div class="word-card" onclick="Words.reveal()">
        <div class="w-word">${Util.esc(w[0])}</div>
        <div class="w-phon">${Util.esc(w[1])}</div>
        ${this.revealed
          ? `<div class="w-mean">${Util.esc(w[2])}</div>`
          : `<div class="w-hint">👆 点击卡片查看释义</div>`}
      </div>
      ${this.revealed ? `
        <div class="word-btns">
          <button class="btn wb-no" onclick="Words.answer(0)">😵 不认识</button>
          <button class="btn wb-vague" onclick="Words.answer(1)">🤔 模糊</button>
          <button class="btn wb-yes" onclick="Words.answer(2)">😎 认识</button>
        </div>` : `
        <button class="btn ghost" onclick="Words.reveal()">显示释义</button>`}
      <button class="btn ghost mt12" onclick="Words.quit()">结束本轮</button>`;
  },

  start() {
    this.buildQueue();
    if (!this.queue.length) { UI.toast('今天没有待学的词，休息一下吧 ☕'); return; }
    this.next();
  },

  next() {
    this.revealed = false;
    this.cur = this.queue.length ? this.queue.shift() : null;
    if (this.cur == null) UI.toast('本轮完成！🎉');
    this.render();
    Today.render();
  },

  reveal() {
    if (!this.revealed) { this.revealed = true; this.render(); }
  },

  answer(grade) {
    const p = Store.data.words.progress;
    const st = p[this.cur] || { level: 0, next: Util.today(), seen: 0 };
    st.seen++;
    if (grade === 2) st.level = Math.min(st.level + 1, 5);
    else if (grade === 1) st.level = Math.max(st.level, 1);
    else { st.level = 0; this.queue.push(this.cur); } // 不认识：本轮稍后再来一次
    st.next = Util.addDays(Util.today(), this.INTERVALS[st.level]);
    p[this.cur] = st;

    const t = Util.today();
    Store.data.words.log[t] = (Store.data.words.log[t] || 0) + 1;
    Store.save();
    this.next();
  },

  quit() { this.cur = null; this.render(); },

  setGoal() {
    UI.modal(`
      <h3>每日目标</h3>
      <div class="field"><label>每天学习单词数</label>
        <input type="number" inputmode="numeric" id="goalInput" value="${Store.data.words.dailyGoal}"></div>
      <button class="btn" onclick="Words.saveGoal()">保存</button>`);
  },

  saveGoal() {
    const v = parseInt(document.getElementById('goalInput').value);
    if (v > 0) { Store.data.words.dailyGoal = v; Store.save(); }
    UI.closeModal(); this.render();
  }
};
