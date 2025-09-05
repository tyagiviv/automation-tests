// pagination.js
export function setupPagination(
  prevBtn,
  nextBtn,
  pageSizeSelect,
  displayRunsFn,
  getAllRuns,
  getCurrentPage,
  setCurrentPage,
  runsContainer
) {

  function update() {
    displayRunsFn();
    const pageRuns = runsContainer.querySelectorAll('.run-item');
    if(pageRuns.length === 0) {
      document.querySelectorAll('.run-item.selected').forEach(el => el.classList.remove('selected'));
    }
  }

  prevBtn.addEventListener('click', () => {
    const currentPage = getCurrentPage();
    if(currentPage > 1) {
      setCurrentPage(currentPage - 1);
      update();
    }
  });

  nextBtn.addEventListener('click', () => {
    const allRuns = getAllRuns();
    const pageSize = parseInt(pageSizeSelect.value, 10);
    const totalPages = Math.ceil(allRuns.length / pageSize);
    const currentPage = getCurrentPage();
    if(currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      update();
    }
  });

  pageSizeSelect.addEventListener('change', () => {
    setCurrentPage(1);
    update();
  });
}
