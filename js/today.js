/* ===== 今日总览页 ===== */
const Today = {
  render() {
    const el = document.getElementById('page-today');
    const t = Util.today();
    const name = Store.data.profile.name;
    const sig = Store.data.profile.signature;
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
        <div class="hero-main">
          <div class="date">${t} · 周${Util.weekCN(t)}</div>
          <div class="greet" onclick="App.editSignature()" title="点此修改个性签名">${sig ? Util.esc(sig) : (greet + (name ? '，' + Util.esc(name) : '') + ' 👋')}</div>
          <div class="shift-chip ${mine[t] ? 'mine' : ''}${shift ? ' sk-' + Util.shiftKind(shift) : ''}">${shift ? '今日班次：' + Util.esc(Util.shiftLabel(shift)) : '今日暂无排班记录'}</div>
          ${tomorrow ? `<div style="font-size:12px;margin-top:8px">明天：${Util.esc(Util.shiftLabel(tomorrow))}</div>` : ''}
        </div>
        <img class="hero-avatar" src="${Store.data.profile.avatar || 'shuyuan.png?v=20260727u'}" alt="书源" title="点此更换照片" onclick="Today.changeAvatar()">
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
  },

  // 点击书源照片 → 选择本地图片 → 压缩后存入 localStorage（固定、不丢）
  changeAvatar() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = () => {
      const file = inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const max = 320;
          const scale = Math.min(max / img.width, max / img.height, 1);
          const cw = Math.max(1, Math.round(img.width * scale));
          const ch = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
          try {
            Store.data.profile.avatar = canvas.toDataURL('image/jpeg', 0.85);
            Store.save();
            Today.render();
            UI.toast('照片已更新 ✓');
          } catch (err) {
            UI.toast('图片太大无法保存，换张小一点的');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }
};
