/* ===== 应用入口与导航（左侧抽屉） ===== */
const App = {
  titles: { today: '今日', schedule: '排班', health: '健康', words: '单词', plan: '每日计划' },
  curPage: 'today',

  go(page) {
    this.curPage = page;
    document.querySelectorAll('.tab, .sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    document.getElementById('topbarTitle').textContent = this.titles[page];
    const mod = { today: Today, schedule: Schedule, health: Health, words: Words, plan: Plan }[page];
    if (mod && mod.render) mod.render();
    window.scrollTo(0, 0);
    this.closeSidebar();
  },

  openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarMask').classList.add('show');
  },
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarMask').classList.remove('show');
  },
  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarMask').classList.toggle('show');
  },

  settings() {
    UI.modal(`
      <h3>设置</h3>
      <div class="field"><label>我的姓名（用于排班识别）</label>
        <input id="setName" value="${Util.esc(Store.data.profile.name)}"></div>
      <button class="btn" onclick="App.saveSettings()">保存</button>
      <div class="card-title mt16">数据管理</div>
      <p class="muted" style="margin-bottom:10px">所有数据仅保存在本机浏览器中。建议定期导出备份，防止清理浏览器数据时丢失。</p>
      <button class="btn ghost" onclick="Store.export()">📤 导出数据备份</button>
      <input type="file" id="importFile" accept=".json" style="display:none" onchange="App.onImport(this)">
      <button class="btn ghost mt8" onclick="document.getElementById('importFile').click()">📥 恢复备份</button>`);
  },

  saveSettings() {
    Store.data.profile.name = document.getElementById('setName').value.trim();
    Store.save(); UI.closeModal(); Today.render();
    UI.toast('已保存 ✓');
  },

  onImport(input) {
    const f = input.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
      try {
        Store.import(e.target.result);
        UI.closeModal();
        App.go('today');
        UI.toast('恢复成功 ✓');
      } catch (err) { UI.toast('文件格式不正确'); }
    };
    r.readAsText(f);
    input.value = '';
  },

  init() {
    Store.load();
    Schedule.init();
    Plan.init();
    document.getElementById('sidebarSub').textContent = Store.data.profile.name + ' 的工作台';
    document.querySelectorAll('.tab, .sidebar-item').forEach(b => b.onclick = () => this.go(b.dataset.page));
    document.getElementById('menuBtn').onclick = () => this.toggleSidebar();
    document.getElementById('sidebarMask').onclick = () => this.closeSidebar();
    document.getElementById('settingsBtn').onclick = () => this.settings();
    document.getElementById('sidebarSettings').onclick = () => this.settings();
    this.go('today');
  }
};

App.init();
