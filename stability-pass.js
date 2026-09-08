(() => {
  'use strict';
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  if (!isAdmin) return;

  document.documentElement.classList.add('mtgx-admin-document');
  document.body.classList.add('mtgx-admin-mode');

  const addEmptyChartState = () => {
    document.querySelectorAll('.admin-page .chart-bars').forEach((bars) => {
      const placeholder = bars.querySelector('.mtgx-empty-chart');
      const realBars = [...bars.children].filter((child) => !child.classList.contains('mtgx-empty-chart'));
      if (realBars.length) {
        placeholder?.remove();
        return;
      }
      if (placeholder) return;

      const empty = document.createElement('div');
      empty.className = 'mtgx-empty-chart';
      empty.setAttribute('aria-label', 'Gráfico sem interesses registrados');
      empty.innerHTML = Array.from({ length: 7 }, (_, index) => {
        const labels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
        return `<span class="mtgx-empty-bar-wrap"><i style="height:${index === 6 ? 9 : 5}px"></i><b>${labels[index]}</b></span>`;
      }).join('');
      bars.appendChild(empty);
    });
  };

  const markAdmin = () => {
    document.querySelector('.admin-page')?.setAttribute('data-layout-stable', 'true');
    addEmptyChartState();
  };

  markAdmin();
  new MutationObserver(markAdmin).observe(document.documentElement, { childList: true, subtree: true });
})();
