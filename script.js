window.addEventListener("DOMContentLoaded", () => {
  const fileSelector = document.getElementById("file-selector");
  fileSelector.addEventListener("change", (event) => {
    const fileList = event.target.files;
    if (fileList.length > 0) {
      process(fileList[0]);
    }
  });
  document
    .getElementById("include-title")
    .addEventListener("change", (event) => {
      const h1 = document.querySelector("h1");
      if (event.target.checked) {
        h1.removeAttribute("hidden");
      } else {
        h1.setAttribute("hidden", "true");
      }
    });
  document.getElementById("print").addEventListener("click", () => {
    print();
  });
  document.getElementById("toGrid").addEventListener("click", () => {
    document.querySelector("main").classList.remove("list");
    document.querySelector("main").classList.add("grid");
  });
  document.getElementById("toList").addEventListener("click", () => {
    document.querySelector("main").classList.remove("grid");
    document.querySelector("main").classList.add("list");
  });
  document.getElementById("toSmall").addEventListener("click", () => {
    document.querySelector("main").classList.remove("large");
    document.querySelector("main").classList.add("small");
  });
  document.getElementById("toLarge").addEventListener("click", () => {
    document.querySelector("main").classList.remove("small");
    document.querySelector("main").classList.add("large");
  });
});

function process(file) {
  file.text().then((data) => {
    if (data.match(/<html/i)) processAsHTML(data);
    else processAsCSV(data);
  });
}

function processAsCSV(data) {
  if (!Papa) throw new Error("Missing papaparse dependency");
  const csv = Papa.parse(data);
  const dataRows = csv.data.filter((arr) =>
    arr.some((s) => s.match(/@hanover.edu/))
  );
  const results = dataRows.map(([name, _a, _b, email]) => ({ name, email }));
  createPageFrom(results);
}

function processAsHTML(data) {
  const el = document.createElement("html");
  el.innerHTML = data;
  console.log(el);
  const header = el.querySelectorAll("thead tr")[1];
  const columnEntries = header.querySelectorAll("th");
  const columnTitles = [...columnEntries].map((n) => n.textContent);
  const nameRow = columnTitles.indexOf("Student");
  const emailRow = columnTitles.indexOf("Email");
  console.log(nameRow, emailRow);
  const rows = el.querySelectorAll("tbody tr");
  const results = [];
  for (const r of rows) {
    const name = r.querySelector(`td:nth-child(${nameRow + 1})`).textContent;
    const email = r.querySelector(`td:nth-child(${emailRow + 1})`).textContent;
    results.push({ name, email });
  }
  createPageFrom(results);
}

function createPageFrom(results) {
  const studentsEl = document.querySelector("#students");
  studentsEl.innerHTML = "";
  for (const { name, email } of results) {
    const login = email.replace("@hanover.edu", "");
    const [last, first, middle] = name.split(/[, ]+/g);
    const imgLink = `https://my.hanover.edu/icsfileserver/icsphotos/${login}.jpg`;
    const html = `<section><img src="${imgLink}" /><h2>${first} ${last}</h2></section>`;
    studentsEl.insertAdjacentHTML("beforeend", html);
  }
}
