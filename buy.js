(async function () {
  const data = await fetch('data/shops.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
  const catList = document.getElementById('catList');
  const storeList = document.getElementById('storeList');
  const catTitle = document.getElementById('catTitle');
  const resultCount = document.getElementById('resultCount');
  const empty = document.getElementById('empty');
  const searchInput = document.getElementById('searchInput');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  let activeCat = '全部';
  let keyword = '';

  const icons = { '茶叶': '🍵', '香榧': '🌰', '黄精': '🫘', '高山产品': '🥬', '药食同源糕点': '🍰' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCats() {
    catList.innerHTML = data.categories.map(function (c) {
      const n = c === '全部' ? data.stores.length : data.stores.filter(function (s) { return s.category === c; }).length;
      return '<button class="cat' + (c === activeCat ? ' active' : '') + '" data-cat="' + esc(c) + '">' +
        '<span>' + esc(c) + '</span><em>' + n + '</em></button>';
    }).join('');
    catList.querySelectorAll('.cat').forEach(function (b) {
      b.addEventListener('click', function () {
        activeCat = b.getAttribute('data-cat');
        renderCats();
        renderStores();
      });
    });
  }

  function matchStore(s) {
    if (activeCat !== '全部' && s.category !== activeCat) return false;
    if (!keyword) return true;
    const text = [s.name, s.category, s.desc, s.platform]
      .concat(s.products.map(function (p) { return p.name + p.desc; }))
      .join(' ');
    return text.indexOf(keyword) !== -1;
  }

  function renderStores() {
    const list = data.stores.filter(matchStore);
    catTitle.textContent = activeCat;
    resultCount.textContent = list.length + ' 家店';
    empty.hidden = list.length > 0;
    storeList.innerHTML = list.map(function (s) {
      const products = s.products.map(function (p, i) {
        return '<button class="product" data-store="' + esc(s.id) + '" data-index="' + i + '">' +
          '<span class="thumb">' + (icons[s.category] || '🛍️') + '</span>' +
          '<span class="p-text"><span class="p-name">' + esc(p.name) + '</span>' +
          '<span class="p-desc">' + esc(p.desc) + '</span></span>' +
          '<span class="p-price">' + esc(p.price) + '</span></button>';
      }).join('');
      return '<article class="store">' +
        '<div class="store-head"><h3>' + esc(s.name) + '</h3><span class="badge">' + esc(s.platform) + '</span></div>' +
        '<p class="store-desc">' + esc(s.desc) + '</p>' +
        '<div class="products">' + products + '</div>' +
        '<a class="store-link" href="' + esc(s.link) + '" target="_blank" rel="noopener">进店看看 →</a>' +
        '</article>';
    }).join('');
    storeList.querySelectorAll('.product').forEach(function (b) {
      b.addEventListener('click', function () {
        const s = data.stores.find(function (x) { return x.id === b.getAttribute('data-store'); });
        const p = s.products[Number(b.getAttribute('data-index'))];
        openModal(s, p);
      });
    });
  }

  function openModal(s, p) {
    modalBody.innerHTML = '<p class="modal-cat">' + esc(s.category) + ' · ' + esc(s.platform) + '</p>' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p class="modal-price">' + esc(p.price) + '</p>' +
      '<p class="modal-desc">' + esc(p.desc) + '</p>' +
      '<p class="modal-store">店铺：' + esc(s.name) + '</p>' +
      '<div class="modal-btns">' +
      '<a class="btn-primary" href="' + esc(s.link) + '" target="_blank" rel="noopener">进店购买</a>' +
      '<button class="btn-ghost" id="copyLink">复制店铺链接</button>' +
      '</div>';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const copy = document.getElementById('copyLink');
    copy.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s.link).then(function () {
          copy.textContent = '已复制';
        });
      } else {
        copy.textContent = '请长按复制';
      }
    });
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  searchInput.addEventListener('input', function () {
    keyword = searchInput.value.trim();
    renderStores();
  });

  renderCats();
  renderStores();
})();
