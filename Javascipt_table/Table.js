export class TableComponent {
  constructor(data, columns) {
    this.data = data;
    this.columns = columns;
    this.filteredData = data;
    this.rowHeight = 50; // px
    this.bufferSize = 5;
    this.tableBody = document.getElementById("tableBody");
    this.scrollContainer = document.getElementById("scrollContainer");
    this.spacer = document.querySelector(".spacer");
    this.filterInput = document.getElementById("filterInput");
    this.currentSort = { key: null, direction: 'asc' };
  }

  init() {
    this.createHeader();
    this.attachEvents();
    this.updateSpacerHeight();
    this.renderVisibleRows();
  }

  createHeader() {
    const tableHeader = document.getElementById("tableHeader");
    while (tableHeader.firstChild) {
      tableHeader.removeChild(tableHeader.firstChild);
    }

    this.columns.forEach((col) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (col.width) {
        cell.style.width = col.width;
      }
      cell.textContent = col.label;
      if (col.sortable) {
        cell.classList.add("sort-header");
        cell.setAttribute("data-key", col.key);
        const sortIcon = document.createElement("span");
        sortIcon.classList.add("sort-icon");
        sortIcon.textContent = "↕";
        cell.appendChild(sortIcon);
      }
      tableHeader.appendChild(cell);
    });
  }

  attachEvents() {
    this.scrollContainer.addEventListener("scroll", () => this.renderVisibleRows());
    this.filterInput.addEventListener("input", this.debounce((e) => this.handleFilter(e.target.value), 300));
    document.getElementById("tableHeader").addEventListener("click", (e) => {
      const header = e.target.closest(".sort-header");
      if (header) {
        const key = header.getAttribute("data-key");
        if (this.currentSort.key === key) {
          this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSort.key = key;
          this.currentSort.direction = 'asc';
        }
        this.updateSortIcons();
        this.sortData();
        this.renderVisibleRows();
      }
    });
  }

  handleFilter(query) {
    this.filteredData = this.data.filter((item) => {
      return this.columns.some((col) => {
        if (col.filterable) {
          return item[col.key].toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    });

    if (this.filteredData.length === 0) {
      const noDataRow = document.createElement('div');
      noDataRow.classList.add('row');
      noDataRow.textContent = 'No data found';
      noDataRow.style.textAlign = 'center';
      noDataRow.style.padding = '10px';
      noDataRow.style.color = 'red';
      while (this.tableBody.firstChild) {
        this.tableBody.removeChild(this.tableBody.firstChild);
      }
      this.tableBody.appendChild(noDataRow);
      return;
    }

    this.sortData();
    this.updateSpacerHeight();
    this.renderVisibleRows();
  }

  sortData() {
    const { key, direction } = this.currentSort;
    if (!key) return;
  
    const dir = direction === 'asc' ? 1 : -1;
    this.filteredData.sort((a, b) => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return (a[key] - b[key]) * dir;
      } else if (!isNaN(Date.parse(a[key])) && !isNaN(Date.parse(b[key]))) {
        return (new Date(a[key]) - new Date(b[key])) * dir;
      } else {
        return a[key].toString().toLowerCase().localeCompare(b[key].toString().toLowerCase()) * dir;
      }
    });
  }
  

  updateSortIcons() {
    document.querySelectorAll(".sort-header").forEach((header) => {
      const icon = header.querySelector(".sort-icon");
      const key = header.getAttribute("data-key");
      if (key === this.currentSort.key) {
        icon.textContent = this.currentSort.direction === 'asc' ? '⬆️' : '⬇️';
      } else {
        icon.textContent = '↕';
      }
    });
  }

  debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  updateSpacerHeight() {
    this.spacer.style.height = `${this.filteredData.length * this.rowHeight}px`;
  }

  renderVisibleRows() {
    const scrollTop = this.scrollContainer.scrollTop;
    const containerHeight = this.scrollContainer.clientHeight;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.rowHeight) - this.bufferSize
    );
    const endIndex = Math.min(
      this.filteredData.length,
      Math.ceil((scrollTop + containerHeight) / this.rowHeight) + this.bufferSize
    );

    this.tableBody.style.transform = `translateY(${startIndex * this.rowHeight}px)`;
    const visibleData = this.filteredData.slice(startIndex, endIndex);
    while (this.tableBody.firstChild) {
      this.tableBody.removeChild(this.tableBody.firstChild);
    }

    visibleData.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";
      this.columns.forEach((col) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if (col.width) {
          cell.style.width = col.width;
        }
        if (typeof col.render === "function") {
          const rendered = col.render(row[col.key]);
          cell.appendChild(rendered);
        } else {
          cell.textContent = row[col.key];
        }
        rowDiv.appendChild(cell);
      });

      this.tableBody.appendChild(rowDiv);
    });
  }
}
