/* ===== 单词模块：卡片学习 + 简化间隔复习 ===== */
const Words = {
  queue: [],        // 本轮学习队列（词库下标）
  cur: null,        // 当前下标
  revealed: false,
  phrasesView: false,   // 是否处于「高频词组」浏览
  phCur: null,          // 当前词组下标（null=词组概览页）
  phRevealed: false,
  phQueue: [],          // 词组学习队列

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
    if (this.phrasesView) { this.renderPhrases(); return; }
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
        <button class="btn ghost mt12" onclick="Words.showPhrases()">📚 高频词组（${PHRASES_DATA.length} 个）</button>
        <p class="muted center mt12">词库：同等学力申硕英语核心词汇 · 共 ${s.total} 词<br>之后可以随时让我扩充词库或导入你自己的词表</p>`;
      return;
    }

    const w = WORDS_DATA[this.cur];
    const left = this.queue.length;
    el.innerHTML = `
      <div class="muted center" style="margin-bottom:10px">本轮剩余 ${left + 1} 个 · 今日已学 ${s.todayCount}</div>
      <div class="word-card" onclick="Words.reveal()">
        <button class="w-speak" onclick="event.stopPropagation(); Words.speak(${this.cur})" title="点击发音">🔊</button>
        <div class="w-word">${Util.esc(w[0])}</div>
        <div class="w-phon">${Util.esc(w[1])} <span class="w-say" onclick="event.stopPropagation(); Words.speak(${this.cur})">🔊 发音</span></div>
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

  // 点击发音：用系统语音朗读（iOS Safari / 安卓 / 桌面均支持 Web Speech API）
  say(text) {
    if (!('speechSynthesis' in window)) { UI.toast('当前设备不支持发音'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      const voices = speechSynthesis.getVoices();
      const v = voices.find(x => /en[-_]US/i.test(x.lang)) || voices.find(x => /^en/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { UI.toast('发音失败，请重试'); }
  },
  speak(idx) { const w = WORDS_DATA[idx]; if (w) this.say(w[0]); },
  sayPhrase(idx) { const p = PHRASES_DATA[idx]; if (p) this.say(p[0]); },

  // ===== 高频词组（翻卡学习模式：一页一个，点开看释义+例句）=====
  showPhrases() { this.phrasesView = true; this.phCur = null; this.phRevealed = false; this.render(); },
  backToList() { this.phrasesView = false; this.phCur = null; this.phRevealed = false; this.render(); },

  startPhrases() {
    // 先学未熟悉的，已熟悉的排后面
    const fam = Store.data.words.phraseFam || {};
    const unfam = [], famd = [];
    PHRASES_DATA.forEach((_, i) => (fam[i] ? famd : unfam).push(i));
    this.phQueue = unfam.concat(famd);
    this.phNext();
  },

  phNext() {
    this.phRevealed = false;
    this.phCur = this.phQueue.length ? this.phQueue.shift() : null;
    if (this.phCur == null) UI.toast('全部过完啦！🎉');
    this.render();
  },

  phReveal() { if (!this.phRevealed) { this.phRevealed = true; this.render(); } },

  phAnswer(grade) {
    const fam = Store.data.words.phraseFam || (Store.data.words.phraseFam = {});
    if (grade === 2) fam[this.phCur] = true;          // 认识 → 标熟悉
    else if (grade === 0) { delete fam[this.phCur]; this.phQueue.push(this.phCur); } // 不认识 → 本轮稍后再来
    // grade 1（模糊）：保持原状
    Store.save();
    this.phNext();
  },

  // 朗读例句（按序号取，避免字符串转义问题）
  sayExample(i, ei) {
    const p = PHRASES_DATA[i];
    const ex = p && p[3] && p[3][ei];
    if (ex) this.say(ex[0]);   // 只朗读英文
  },

  // 例句里高亮词组（先转义 HTML，再按词组名包裹 <mark>；兼容常见动词变形）
  phHighlight(text, phrase) {
    const esc = Util.esc(text);
    const tok = phrase.split(/\s+/).map(t => {
      const bare = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (/^be$/i.test(t)) return '(?:be|is|are|was|were|been|being)';
      return bare + '(?:s|es|ed|ing)?';
    });
    try { return esc.replace(new RegExp('(' + tok.join('\\s+') + ')', 'gi'), '<mark class="ph-hl">$1</mark>'); }
    catch (e) { return esc; }
  },

  renderPhrases() {
    const el = document.getElementById('page-words');
    const fam = Store.data.words.phraseFam || {};
    const total = PHRASES_DATA.length;
    const known = PHRASES_DATA.filter((_, i) => fam[i]).length;

    // 概览页（未开始学习）
    if (this.phCur == null) {
      el.innerHTML = `
        <div class="grid2">
          <div class="card"><div class="card-title">已熟悉</div>
            <div class="stat-num" style="color:var(--primary)">${known}<small>/ ${total}</small></div>
            <div class="progress-bar"><i style="width:${(known / total * 100).toFixed(1)}%"></i></div></div>
          <div class="card"><div class="card-title">学习模式</div>
            <div class="stat-num" style="font-size:20px">翻卡</div>
            <div class="stat-sub">一页一个词组，点开看释义与例句</div></div>
        </div>
        <button class="btn" onclick="Words.startPhrases()">🚀 开始学习词组</button>
        <button class="btn ghost mt12" onclick="Words.backToList()">返回单词</button>
        <p class="muted center mt12">高频词组 · 同等学力英语 · 共 ${total} 组<br>点卡片听发音、看例句；掌握后标「✓ 已熟悉」</p>`;
      return;
    }

    // 翻卡页（一个词组一页）
    const p = PHRASES_DATA[this.phCur];
    const idx = this.phCur;
    const examples = (p[3] || []).map((ex, ei) =>
      `<div class="ph-ex">
         <button class="ph-ex-speak" onclick="event.stopPropagation(); Words.sayExample(${idx}, ${ei})" title="朗读例句">🔊</button>
         <div class="ph-ex-body">
           <span class="ph-ex-en">${this.phHighlight(ex[0], p[0])}</span>
           <span class="ph-ex-zh">${Util.esc(ex[1])}</span>
         </div>
       </div>`).join('');

    el.innerHTML = `
      <div class="muted center" style="margin-bottom:10px">高频词组 · 第 ${idx + 1}/${total} 个 · 已熟悉 ${known}/${total} <span class="more" onclick="Words.backToList()">结束</span></div>
      <div class="word-card" onclick="Words.phReveal()">
        <button class="w-speak" onclick="event.stopPropagation(); Words.sayPhrase(${idx})" title="点击发音">🔊</button>
        <div class="w-word">${Util.esc(p[0])}</div>
        <div class="w-phon">${Util.esc(p[1])} <span class="w-say" onclick="event.stopPropagation(); Words.sayPhrase(${idx})">🔊 发音</span></div>
        ${this.phRevealed
          ? `<div class="w-mean">${Util.esc(p[2])}</div>
             <div class="ph-examples">
               <div class="ph-ex-label">例句</div>
               ${examples || '<div class="muted">（暂无例句）</div>'}
             </div>`
          : `<div class="w-hint">👆 点击卡片查看释义与例句</div>`}
      </div>
      ${this.phRevealed ? `
        <div class="word-btns">
          <button class="btn wb-no" onclick="Words.phAnswer(0)">😵 不认识</button>
          <button class="btn wb-vague" onclick="Words.phAnswer(1)">🤔 模糊</button>
          <button class="btn wb-yes" onclick="Words.phAnswer(2)">😎 认识</button>
        </div>` : `
        <button class="btn ghost" onclick="Words.phReveal()">显示释义</button>`}
      <button class="btn ghost mt12" onclick="Words.backToList()">结束本轮</button>`;
  },

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
