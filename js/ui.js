/* ===== 通用 UI：弹窗 / Toast ===== */
const UI = {
  toast(msg, ms = 1800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => t.classList.remove('show'), ms);
  },

  modal(html) {
    const mask = document.getElementById('modalMask');
    const box = document.getElementById('modalBox');
    box.innerHTML = html;
    mask.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modalMask').classList.remove('show');
    document.body.style.overflow = '';
  },

  confirm(msg, onOk) {
    this.modal(`
      <h3>确认</h3>
      <p style="color:var(--text-2);font-size:15px;line-height:1.6">${msg}</p>
      <div class="row mt16">
        <button class="btn ghost" onclick="UI.closeModal()">取消</button>
        <button class="btn danger" id="confirmOkBtn">确定</button>
      </div>`);
    document.getElementById('confirmOkBtn').onclick = () => { this.closeModal(); onOk(); };
  }
};

document.getElementById('modalMask').addEventListener('click', e => {
  if (e.target === e.currentTarget) UI.closeModal();
});
