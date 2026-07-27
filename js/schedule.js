/* ===== 排班模块：Excel / Word 导入 + 月历 ===== */
const Schedule = {
  viewYear: null, viewMonth: null, selectedDate: null,

  init() {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    this.selectedDate = Util.today();
  },

  render() {
    const el = document.getElementById('page-schedule');
    const d = Store.data.schedule;
    el.innerHTML = `
      <div class="card">
        <div class="cal-head">
          <div class="cal-month">${this.viewYear}年${this.viewMonth + 1}月</div>
          <div class="cal-nav">
            <button onclick="Schedule.nav(-1)">‹</button>
            <button onclick="Schedule.nav(0)">今</button>
            <button onclick="Schedule.nav(1)">›</button>
          </div>
        </div>
        <div class="cal-grid">${this.calHTML()}</div>
      </div>
      <div class="card" id="dayDetail">${this.dayDetailHTML()}</div>
      <div class="card">
        <div class="card-title">排班表导入</div>
        <p class="muted" style="margin-bottom:10px">支持 Excel(.xlsx) 与 Word(.docx)。表头为班次类别，你的名字出现在哪个类别，那天就是那个班。${d.lastImport ? '<br>上次导入：' + Util.esc(d.lastImport) : ''}</p>
        <input type="file" id="xlsxFile" accept=".xlsx,.xls,.docx" style="display:none" onchange="Schedule.onFile(this)">
        <button class="btn" onclick="document.getElementById('xlsxFile').click()">📥 导入排班表（Excel / Word）</button>
        <button class="btn ghost mt8" onclick="Schedule.clearAll()">清空排班数据</button>
      </div>`;
  },

  calHTML() {
    let html = '日一二三四五六'.split('').map(w => `<div class="cal-week">${w}</div>`).join('');
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    const shifts = Store.data.schedule.shifts;
    const mine = Store.data.schedule.mine || {};
    const today = Util.today();
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = Util.fmt(d);
      const other = d.getMonth() !== this.viewMonth;
      const cls = ['cal-day', other ? 'other' : '', ds === today ? 'today' : '', ds === this.selectedDate ? 'selected' : ''].join(' ');
      const shift = shifts[ds];
      const tagCls = mine[ds] ? 'shift-tag mine' : 'shift-tag';
      html += `<div class="${cls}" onclick="Schedule.pick('${ds}')">
        <span>${d.getDate()}</span>
        ${shift ? `<span class="${tagCls}">${Util.esc(Util.shiftLabel(shift))}</span>` : ''}
      </div>`;
    }
    return html;
  },

  dayDetailHTML() {
    const ds = this.selectedDate;
    const shift = Store.data.schedule.shifts[ds];
    const mine = Store.data.schedule.mine || {};
    const cls = mine[ds] ? 'shift-mine' : '';
    return `
      <div class="card-title">${ds}（周${Util.weekCN(ds)}）
        <span class="more" onclick="Schedule.editDay('${ds}')">${shift ? '修改' : '添加班次'}</span>
      </div>
      ${shift
        ? `<div class="${cls}" style="font-size:20px;font-weight:700;color:var(--primary-dark)">${Util.esc(Util.shiftLabel(shift))}</div>`
        : `<div class="muted">这天暂无排班记录</div>`}`;
  },

  pick(ds) { this.selectedDate = ds; this.render(); },

  nav(dir) {
    if (dir === 0) {
      const now = new Date();
      this.viewYear = now.getFullYear(); this.viewMonth = now.getMonth();
    } else {
      this.viewMonth += dir;
      if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
      if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
    }
    this.render();
  },

  editDay(ds) {
    const cur = Store.data.schedule.shifts[ds] || '';
    UI.modal(`
      <h3>${ds} 的班次</h3>
      <div class="field"><label>班次名称（留空则删除）</label>
        <input id="shiftInput" value="${Util.esc(cur)}" placeholder="如：白班 / 夜班 / 休">
      </div>
      <button class="btn" onclick="Schedule.saveDay('${ds}')">保存</button>`);
    setTimeout(() => document.getElementById('shiftInput').focus(), 100);
  },

  saveDay(ds) {
    const v = document.getElementById('shiftInput').value.trim();
    if (v) Store.data.schedule.shifts[ds] = v;
    else delete Store.data.schedule.shifts[ds];
    Store.save(); UI.closeModal(); this.render(); Today.render();
  },

  clearAll() {
    UI.confirm('确定清空所有排班数据？此操作不可恢复。', () => {
      Store.data.schedule.shifts = {};
      Store.data.schedule.mine = {};
      Store.data.schedule.lastImport = null;
      Store.save(); this.render(); Today.render();
      UI.toast('已清空');
    });
  },

  /* ---------- 文件入口：按后缀分流 ---------- */
  onFile(input) {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.docx')) return this.onWordFile(file);
    if (lower.endsWith('.doc')) return UI.toast('暂不支持 .doc 老格式，请先在 Word 里「另存为 .docx」再导入');
    // Excel
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
        this.pickSheet(wb, file.name);
      } catch (err) { UI.toast('文件解析失败，请确认是 Excel 文件'); }
    };
    reader.readAsArrayBuffer(file);
  },

  onWordFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      if (typeof mammoth === 'undefined') return UI.toast('解析库未加载，请刷新页面重试');
      mammoth.convertToHtml({ arrayBuffer: e.target.result }).then(res => {
        const rows = this.htmlToRows(res.value);
        if (!rows) return UI.toast('未在 Word 中找到表格，请确认排班表是以“表格”形式排版的');
        // 额外读取整篇正文文字（含表格外的“2026年7月排班表”标题）用于推断年月
        const docText = res.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        this.askName(rows, file.name, docText);
      }).catch(err => UI.toast('Word 解析失败，请确认是 .docx 文件'));
    };
    reader.readAsArrayBuffer(file);
  },

  htmlToRows(html) {
    const tables = html.match(/<table[\s\S]*?<\/table>/gi);
    if (!tables || !tables.length) return null;
    const t = tables[0];
    const trs = t.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    return trs.map(tr => {
      const cells = tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || [];
      return cells.map(c => c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    });
  },

  /* ---------- Excel 工作表选择 ---------- */
  pickSheet(wb, fname) {
    if (wb.SheetNames.length === 1) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
      return this.askName(rows, fname);
    }
    UI.modal(`<h3>选择工作表</h3>${wb.SheetNames.map((n, i) => `<button class="btn ghost mt8" onclick="Schedule._pick(${i})">${Util.esc(n)}</button>`).join('')}`);
    this._wb = wb; this._fname = fname;
    this._pick = i => {
      const rows = XLSX.utils.sheet_to_json(this._wb.Sheets[this._wb.SheetNames[i]], { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
      this.askName(rows, this._fname);
    };
  },

  /* ---------- 询问姓名后统一解析 ---------- */
  askName(rows, fname, docText) {
    const saved = Store.data.profile.name || '筱';
    UI.modal(`
      <h3>你的姓名</h3>
      <p class="muted" style="margin-bottom:10px">输入排班表中你的姓名，我会自动找出属于你的班次。</p>
      <div class="field"><input id="myName" value="${Util.esc(saved)}" placeholder="如：筱"></div>
      <button class="btn" id="parseBtn">开始解析</button>`);
    document.getElementById('parseBtn').onclick = () => {
      const name = document.getElementById('myName').value.trim();
      if (!name) return UI.toast('请输入姓名');
      Store.data.profile.name = name; Store.save();
      UI.closeModal();
      this.parseRows(rows, name, fname, docText);
    };
  },

  // 从文件名 / 表内标题 / Word 正文猜 年、月
  guessYM(rows, fname, docText) {
    let ctxYear = new Date().getFullYear(), ctxMonth = null;
    const flat = (rows.slice(0, 8).flat().join(' ') + ' ' + (fname || '') + ' ' + (docText || ''));
    let m = flat.match(/(\d{4})\s*年/); if (m) ctxYear = +m[1];
    m = flat.match(/(\d{1,2})\s*月/); if (m) ctxMonth = (+m[1]) - 1;
    return { ctxYear, ctxMonth };
  },

  // 将单元格值转 YYYY-MM-DD（失败返回 null）
  toDate(v, ctxYear, ctxMonth) {
    if (v == null || v === '') return null;
    if (v instanceof Date && !isNaN(v)) return Util.fmt(v);
    const s = String(v).trim();
    let m = s.match(/(\d{4})[年\/\-\.](\d{1,2})[月\/\-\.](\d{1,2})/);
    if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
    m = s.match(/^(\d{1,2})[月\/\-\.](\d{1,2})日?$/);
    if (m && ctxYear) return `${ctxYear}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    m = s.match(/^(\d{1,2})日?$/);
    if (m && ctxYear && ctxMonth != null) {
      const day = +m[1];
      if (day >= 1 && day <= 31) return `${ctxYear}-${String(ctxMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return null;
  },

  /* 核心：横向日期 + 纵向班次类别 + 单元格填姓名（放射科/你的 Word 表结构）
     返回 {found, mine} 或 null */
  parseGrid(rows, name, ctxYear, ctxMonth) {
    if (!rows.length) return null;
    let dateRow = -1, dateMap = {};
    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const map = {}; let count = 0;
      for (let c = 0; c < (rows[r] || []).length; c++) {
        const ds = this.toDate((rows[r] || [])[c], ctxYear, ctxMonth);
        if (ds) { map[c] = ds; count++; }
      }
      if (count >= 10) { dateRow = r; dateMap = map; break; }
    }
    if (dateRow < 0) return null;
    const found = {}, mine = {};
    rows.forEach((row, i) => {
      if (i === dateRow) return;
      const shift = String((row || [])[0] || '').trim();
      if (!shift) return;
      (row || []).forEach((cell, c) => {
        if (c === 0) return;
        if (String(cell).trim() === name && dateMap[c]) {
          const ds = dateMap[c];
          if (!found[ds]) found[ds] = shift;
          else if (!found[ds].split(' / ').includes(shift)) found[ds] += ' / ' + shift;
          mine[ds] = true;
        }
      });
    });
    return { found, mine };
  },

  /* 兜底：姓名行 / 竖排结构（兼容其他 Excel 格式） */
  parseLegacy(rows, name, ctxYear, ctxMonth) {
    const found = {}, mine = {};
    // 方案A：横排，姓名在某行，日期在表头行
    for (let hr = 0; hr < Math.min(rows.length, 10); hr++) {
      let dateCols = 0; const map = {};
      for (let c = 0; c < (rows[hr] || []).length; c++) {
        const ds = this.toDate((rows[hr] || [])[c], ctxYear, ctxMonth);
        if (ds) { map[c] = ds; dateCols++; }
      }
      if (dateCols >= 5) {
        let hit = false;
        for (let r = hr + 1; r < rows.length; r++) {
          for (const c in map) {
            if (String((rows[r] || [])[c] || '').trim() === name) {
              for (const c2 in map) {
                const v = String((rows[r] || [])[c2] || '').trim();
                if (v && v !== name) { found[map[c2]] = v; mine[map[c2]] = true; }
              }
              hit = true; break;
            }
          }
          if (hit) break;
        }
      }
    }
    // 方案B：竖排，姓名在表头，日期在列
    if (!Object.keys(found).length) {
      for (let dc = 0; dc < 6; dc++) {
        let dateRows = 0; const map = {};
        for (let r = 0; r < rows.length; r++) {
          const ds = this.toDate((rows[r] || [])[dc], ctxYear, ctxMonth);
          if (ds) { map[r] = ds; dateRows++; }
        }
        if (dateRows >= 5) {
          for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < (rows[r] || []).length; c++) {
              if (String((rows[r] || [])[c] || '').trim() === name) {
                for (const r2 in map) {
                  const v = String((rows[r2] || [])[c] || '').trim();
                  if (v && v !== name) { found[map[r2]] = v; mine[map[r2]] = true; }
                }
                break;
              }
            }
          }
          if (Object.keys(found).length) break;
        }
      }
    }
    return Object.keys(found).length ? { found, mine } : null;
  },

  parseRows(rows, name, fname, docText) {
    const { ctxYear, ctxMonth } = this.guessYM(rows, fname, docText);
    let res = this.parseGrid(rows, name, ctxYear, ctxMonth);
    if (!res || !Object.keys(res.found).length) res = this.parseLegacy(rows, name, ctxYear, ctxMonth);
    if (!res || !Object.keys(res.found).length) {
      // 没能从表格自动识别年份/月份 → 让用户手动选月再解析一次
      return this.askMonth(rows, name, fname, docText, ctxYear);
    }
    this._commit(res, fname);
  },

  // 保存解析结果并刷新
  _commit(res, fname) {
    const n = Object.keys(res.found).length;
    Object.assign(Store.data.schedule.shifts, res.found);
    Store.data.schedule.mine = Object.assign(Store.data.schedule.mine || {}, res.mine);
    Store.data.schedule.lastImport = `${fname}（${n} 天）`;
    Store.save();
    this.render(); Today.render();
    UI.toast(`成功导入 ${n} 天的班次 🎉`);
  },

  // 识别不到日期时，手动选择年/月后重新解析
  askMonth(rows, name, fname, docText, year) {
    const cur = new Date();
    const yOpts = [cur.getFullYear() - 1, cur.getFullYear(), cur.getFullYear() + 1]
      .map(y => `<option value="${y}" ${y === year ? 'selected' : ''}>${y}年</option>`).join('');
    const mOpts = Array.from({ length: 12 }, (_, i) =>
      `<option value="${i}" ${i === cur.getMonth() ? 'selected' : ''}>${i + 1}月</option>`).join('');
    UI.modal(`
      <h3>选择排班月份</h3>
      <p class="muted" style="margin-bottom:10px">没能在表格里自动识别出日期，请手动选择排班对应的年/月，再解析一次。</p>
      <div class="field"><label>年份</label><select id="pickYear">${yOpts}</select></div>
      <div class="field"><label>月份</label><select id="pickMonth">${mOpts}</select></div>
      <button class="btn" id="pickConfirm">重新解析</button>`);
    document.getElementById('pickConfirm').onclick = () => {
      const y = +document.getElementById('pickYear').value;
      const m = +document.getElementById('pickMonth').value;
      UI.closeModal();
      let res = this.parseGrid(rows, name, y, m);
      if (!res || !Object.keys(res.found).length) res = this.parseLegacy(rows, name, y, m);
      if (!res || !Object.keys(res.found).length) {
        return UI.toast('还是没能识别，请确认表格首行是日期、首列是班次类别，且你的名字填在对应格里');
      }
      this._commit(res, fname);
    };
  }
};
