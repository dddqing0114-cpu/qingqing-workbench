/* ===== 今日总览页 ===== */
const Today = {
  render() {
    const el = document.getElementById('page-today');
    const t = Util.today();
    const name = Store.data.profile.name;
    const shift = Store.data.schedule.shifts[t];
    const tomorrow = Store.data.schedule.shifts[Util.addDays(t, 1)];
    const mine = Store.data.schedule.mine || {};

    // 体重
    const ws = [...Store.data.health.weights].sort((a, b) => a.date < b.date ? -1 : 1);
    const latest = ws[ws.length - 1];

    // 打卡
    const habits = Store.data.health.habits;
    const doneHabits = habits.filter(h => h.log[t]).length;

    // 单词
    const wstat = Words.stats();

    // 计划
    const plans = Store.data.plans[t] || [];
    const donePlans = plans.filter(p => p.done).length;

    const hour = new Date().getHours();
    const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

    el.innerHTML = `
      <div class="hero">
        <div class="date">${t} · 周${Util.weekCN(t)}</div>
        <div class="greet">${greet}${name ? '，' + Util.esc(name) : ''} 👋</div>
        <div class="shift-chip ${mine[t] ? 'mine' : ''}">${shift ? '今日班次：' + Util.esc(Util.shiftLabel(shift)) : '今日暂无排班记录'}</div>
        ${tomorrow ? `<div style="font-size:12px;opacity:.8;margin-top:8px">明天：${Util.esc(Util.shiftLabel(tomorrow))}</div>` : ''}
      </div>

      <div class="grid2">
        <div class="card" onclick="App.go('plan')">
          <div class="card-title">📝 今日计划</div>
          <div class="stat-num">${donePlans}<small>/ ${plans.length || 0}</small></div>
          <div class="stat-sub">${plans.length ? (donePlans === plans.length ? '全部完成 🎉' : '进行中') : '点击添加计划'}</div>
        </div>
        <div class="card" onclick="App.go('health')">
          <div class="card-title">🧘 体态打卡</div>
          <div class="stat-num">${doneHabits}<small>/ ${habits.length}</small></div>
          <div class="stat-sub">${doneHabits === habits.length && habits.length ? '今日已完成 💪' : '坚持就是胜利'}</div>
        </div>
        <div class="card" onclick="App.go('health')">
          <div class="card-title">⚖️ 体重</div>
          <div class="stat-num">${latest ? latest.kg : '--'}<small>kg</small></div>
          <div class="stat-sub">${latest && latest.date === t ? '今天已记录 ✓' : '今天还没记录'}</div>
        </div>
        <div class="card" onclick="App.go('words')">
          <div class="card-title">📖 单词</div>
          <div class="stat-num">${wstat.todayCount}<small>/ ${Store.data.words.dailyGoal}</small></div>
          <div class="stat-sub">${wstat.due ? '待复习 ' + wstat.due + ' 个' : '暂无待复习'}</div>
        </div>
      </div>

      ${plans.length ? `
      <div class="card">
        <div class="card-title">今日待办 <span class="more" onclick="App.go('plan')">管理</span></div>
        ${plans.slice(0, 5).map(it => `
          <div class="plan-item ${it.done ? 'done' : ''}">
            <div class="habit-check ${it.done ? 'done' : ''}" onclick="Today.togglePlan('${it.id}')">${it.done ? '✓' : ''}</div>
            <div class="li-main"><div class="li-title">${Util.esc(it.text)}</div></div>
          </div>`).join('')}
      </div>` : ''}`;
  },

  togglePlan(id) {
    const t = Util.today();
    const it = (Store.data.plans[t] || []).find(x => x.id === id);
    if (it) { it.done = !it.done; Store.save(); this.render(); }
  }
};
