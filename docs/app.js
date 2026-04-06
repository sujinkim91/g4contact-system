(function () {
  const MOCK_STORES = [
    {
      id: "259777",
      name: "세븐일레븐 평택점촌로점",
      mgmtName: "세븐 평택점촌로",
      franchise: "세븐일레븐",
      van: "",
      douzone: "",
      opened: false,
    },
    {
      id: "401102",
      name: "GS25 강남역점",
      mgmtName: "GS 강남역",
      franchise: "GS25",
      van: "",
      douzone: "P274131",
      opened: false,
    },
    {
      id: "512903",
      name: "이마트24 부산해운대점",
      mgmtName: "이마트24 해운대",
      franchise: "이마트24",
      van: "VAN-DEMO-01",
      douzone: "",
      opened: false,
    },
  ];

  const state = {
    stores: MOCK_STORES.map((s) => ({ ...s, opened: !!s.opened })),
    currentStoreId: null,
  };

  const views = {
    g4: document.getElementById("view-g4-open-stores"),
    detail: document.getElementById("view-store-detail"),
    storeMgmt: document.getElementById("view-store-management"),
  };

  const tbody = document.getElementById("g4-store-tbody");
  const toastEl = document.getElementById("toast");
  const detailTitle = document.getElementById("detail-title");
  const detailBreadcrumb = document.getElementById("detail-breadcrumb");

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove("toast--hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.add("toast--hidden"), 2200);
  }

  function getStore(id) {
    return state.stores.find((s) => s.id === id);
  }

  function renderTable() {
    tbody.innerHTML = "";
    state.stores.forEach((row) => {
      const tr = document.createElement("tr");
      tr.dataset.storeId = row.id;
      tr.innerHTML = `
        <td class="th-check"><input type="checkbox" aria-label="행 선택" /></td>
        <td>${escapeHtml(row.id)}</td>
        <td><button type="button" class="btn--link js-store-link" data-id="${escapeHtml(row.id)}">${escapeHtml(row.name)}</button></td>
        <td>${escapeHtml(row.mgmtName)}</td>
        <td><button type="button" class="btn--link js-franchise">${escapeHtml(row.franchise)}</button></td>
        <td class="cell-input"><input type="text" class="input input--cell js-van" data-id="${escapeHtml(row.id)}" value="${escapeHtml(row.van)}" placeholder="VAN 코드" ${row.opened ? "disabled" : ""} /></td>
        <td class="cell-input"><input type="text" class="input input--cell js-douzone" data-id="${escapeHtml(row.id)}" value="${escapeHtml(row.douzone)}" placeholder="더존 코드" ${row.opened ? "disabled" : ""} /></td>
        <td>${
          row.opened
            ? '<span class="open-done" role="status">오픈완료</span>'
            : `<button type="button" class="btn btn--open js-open-process" data-id="${escapeHtml(row.id)}">오픈 처리</button>`
        }</td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".js-van").forEach((input) => {
      input.addEventListener("change", () => {
        const s = getStore(input.dataset.id);
        if (s) s.van = input.value.trim();
      });
    });
    tbody.querySelectorAll(".js-douzone").forEach((input) => {
      input.addEventListener("change", () => {
        const s = getStore(input.dataset.id);
        if (s) s.douzone = input.value.trim();
      });
    });
    tbody.querySelectorAll(".js-open-process").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const s = getStore(id);
        if (!s) return;
        const esc = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"');
        const vanInput = tbody.querySelector(`.js-van[data-id="${esc}"]`);
        const dzInput = tbody.querySelector(`.js-douzone[data-id="${esc}"]`);
        if (vanInput) s.van = vanInput.value.trim();
        if (dzInput) s.douzone = dzInput.value.trim();
        if (!s.van || !s.douzone) {
          showToast("VAN 코드와 더존 코드를 모두 입력해 주세요.");
          return;
        }
        s.opened = true;
        renderTable();
        showToast(`${s.name} 오픈 처리가 완료되었습니다.`);
      });
    });
    tbody.querySelectorAll(".js-store-link").forEach((btn) => {
      btn.addEventListener("click", () => navigateToDetail(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function setActiveNav(route) {
    document.querySelectorAll(".nav__link").forEach((a) => a.classList.remove("nav__link--active"));
    const map = { "g4-list": '[data-nav="g4-list"]', "store-mgmt": '[data-nav="store-mgmt"]' };
    const sel = map[route];
    if (sel) document.querySelector(sel)?.classList.add("nav__link--active");
  }

  function showView(name) {
    Object.values(views).forEach((el) => el.classList.add("view--hidden"));
    if (name === "g4") views.g4.classList.remove("view--hidden");
    else if (name === "detail") views.detail.classList.remove("view--hidden");
    else if (name === "store-mgmt") views.storeMgmt.classList.remove("view--hidden");
  }

  function navigateToDetail(storeId) {
    const s = getStore(storeId);
    if (!s) return;
    state.currentStoreId = storeId;
    detailTitle.textContent = `상점 조회 - ${s.name} (#${s.id})`;
    detailBreadcrumb.textContent = `G4 온보딩 > G4 오픈 상점 목록 > 상점 조회`;
    document.getElementById("f-store-name").value = s.name;
    document.getElementById("f-mgmt-name").value = s.mgmtName;
    document.getElementById("f-phone").value = "031-000-0000";
    document.getElementById("f-douzone").value = s.douzone;
    document.getElementById("f-van").value = s.van;
    setActiveNav("g4-list");
    const nextHash = `#/store/${storeId}`;
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
    showView("detail");
  }

  function navigateToG4List() {
    state.currentStoreId = null;
    window.location.hash = "#/g4-open-stores";
    showView("g4");
    setActiveNav("g4-list");
    renderTable();
  }

  function navigateToStoreMgmt() {
    window.location.hash = "#/store-management";
    showView("store-mgmt");
    setActiveNav("store-mgmt");
  }

  function onHashChange() {
    const h = window.location.hash.replace(/^#/, "") || "/g4-open-stores";
    if (h.startsWith("/store/")) {
      const id = h.slice("/store/".length);
      if (getStore(id)) navigateToDetail(id);
      else navigateToG4List();
      return;
    }
    if (h === "/store-management") {
      navigateToStoreMgmt();
      return;
    }
    navigateToG4List();
  }

  document.getElementById("btn-back-list").addEventListener("click", navigateToG4List);

  document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".nav__group");
      if (!group) return;
      group.classList.toggle("nav__group--open");
    });
  });

  document.querySelector('[data-nav="g4-list"]')?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToG4List();
  });

  window.addEventListener("hashchange", onHashChange);

  renderTable();
  onHashChange();
})();
