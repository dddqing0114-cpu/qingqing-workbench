/* ===== 冰箱：记录冷藏 / 冷冻食材 ===== */
const Fridge = {
  render() {
    const f = Store.data.fridge || (Store.data.fridge = { fresh: [], frozen: [] });
    const el = document.getElementById('page-fridge');
    el.innerHTML = `
      <div class="fridge-zone">
        <div class="fz-head">🧊 冷藏</div>
        ${this.listHtml(f.fresh, 'fresh')}
        <button class="btn ghost small" onclick="Fridge.add('fresh')">＋ 添加食材</button>
      </div>
      <div class="fridge-zone">
        <div class="fz-head">❄️ 冷冻</div>
        ${this.listHtml(f.frozen, 'frozen')}
        <button class="btn ghost small" onclick="Fridge.add('frozen')">＋ 添加食材</button>
      </div>`;
  },

  listHtml(arr, zone) {
    if (!arr || !arr.length) return '<div class="muted center" style="padding:10px 0">暂无，点下方添加</div>';
    return '<div class="fr-list">' + arr.map(it =>
      `<div class="fr-item" onclick="Fridge.edit('${zone}', '${it.id}')">
         <div class="fr-name">${Util.esc(it.name)}</div>
         ${it.qty ? `<div class="fr-qty">${Util.esc(it.qty)}</div>` : ''}
         <button class="fr-del" onclick="event.stopPropagation(); Fridge.del('${zone}', '${it.id}')" title="删除">✕</button>
       </div>`).join('') + '</div>';
  },

  add(zone) {
    const name = prompt('食材名称（例如：鸡蛋）');
    if (!name || !name.trim()) return;
    const qty = prompt('数量 / 规格（可留空，例如：1盒、500g）', '');
    if (qty === null) return;
    Store.data.fridge[zone].push({ id: Util.uid(), name: name.trim(), qty: qty.trim() });
    Store.save(); this.render();
  },

  edit(zone, id) {
    const arr = Store.data.fridge[zone];
    const it = arr.find(x => x.id === id);
    if (!it) return;
    const name = prompt('食材名称', it.name);
    if (name === null) return;
    const qty = prompt('数量 / 规格', it.qty || '');
    if (qty === null) return;
    it.name = name.trim();
    it.qty = qty.trim();
    Store.save(); this.render();
  },

  del(zone, id) {
    Store.data.fridge[zone] = Store.data.fridge[zone].filter(x => x.id !== id);
    Store.save(); this.render();
  }
};
