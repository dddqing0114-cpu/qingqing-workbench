/* ===== 应用入口与导航（左侧抽屉） ===== */
const App = {
  titles: { today: '今日', schedule: '排班', health: '健康', words: '单词', plan: '每日计划', fridge: '冰箱' },
  curPage: 'today',

  go(page) {
    this.curPage = page;
    document.querySelectorAll('.tab, .sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    document.getElementById('topbarTitle').textContent = this.titles[page];
    const mod = { today: Today, schedule: Schedule, health: Health, words: Words, plan: Plan, fridge: Fridge }[page];
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
      <div class="field mt12"><label>个性签名（显示在首页绿框，可随时修改）</label>
        <input id="setSig" value="${Util.esc(Store.data.profile.signature)}" maxlength="30" placeholder="例如：今天也要元气满满 💪"></div>
      <button class="btn" onclick="App.saveSettings()">保存</button>
      <div class="card-title mt16">应用更新</div>
      <p class="muted" style="margin-bottom:10px">主屏图标打开的应用没有刷新按钮。点此可重新加载最新版本，不会丢失任何数据。</p>
      <button class="btn ghost" onclick="App.refresh()">🔄 刷新 / 检查更新</button>
      <div class="card-title mt16">数据管理</div>
      <p class="muted" style="margin-bottom:10px">所有数据仅保存在本机浏览器中。建议定期导出备份，防止清理浏览器数据时丢失。</p>
      <button class="btn ghost" onclick="Store.exportModal()">📤 导出数据备份</button>
      <button class="btn ghost mt8" onclick="App.showRestore()">📥 恢复备份</button>`);
  },

  saveSettings() {
    Store.data.profile.name = document.getElementById('setName').value.trim();
    Store.data.profile.signature = document.getElementById('setSig').value.trim();
    Store.save(); UI.closeModal(); Today.render();
    UI.toast('已保存 ✓');
  },

  refresh() {
    UI.toast('正在刷新最新版本…');
    setTimeout(() => { location.reload(true); }, 400);
  },

  editSignature() {
    const cur = Store.data.profile.signature || '';
    const v = prompt('编辑个性签名（显示在首页绿框，留空则恢复默认问候）', cur);
    if (v === null) return;
    Store.data.profile.signature = v.trim();
    Store.save(); Today.render();
    UI.toast('已更新 ✓');
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

  showRestore() {
    UI.modal(`
      <h3>恢复数据备份</h3>
      <p class="muted">① 选择备份文件，或 ② 粘贴之前复制的备份文本，再点「恢复」。恢复时新旧数据自动合并保留，不会互相覆盖。</p>
      <input type="file" id="importFile" accept=".json" class="mt8" onchange="App.onImport(this)">
      <div class="card-title mt16">或粘贴备份文本</div>
      <textarea id="importText" class="bk-text" placeholder="在此粘贴备份文本…"></textarea>
      <button class="btn" onclick="App.restoreFromText()">恢复</button>
      <button class="btn ghost mt8" onclick="UI.closeModal()">取消</button>`);
  },

  restoreFromText() {
    const t = document.getElementById('importText').value.trim();
    if (!t) { UI.toast('请先粘贴备份文本'); return; }
    try {
      Store.import(t);
      UI.closeModal(); App.go('today'); UI.toast('恢复成功 ✓');
    } catch (e) { UI.toast('文本格式不正确'); }
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
