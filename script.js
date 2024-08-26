
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
  // Manual add of users
  document
    .getElementById("manualAddSubmit")
    .addEventListener("click", addStudentFromId);
  document
    .getElementById("manualAddToggle")
    .addEventListener("click", () => { document.getElementById("manualAddSection").classList.toggle("hidden"); });
  // Remove-user button
  const studentsEl = document.getElementById("students");
  studentsEl.addEventListener("click", (ev) => {
    if (ev.target.matches("#students section .delete")) {
      ev.target.closest("section").remove();
    }
  });
  // Drag-and-drop
  studentsEl.addEventListener("dragstart", (ev) => {
    if (ev.target.matches("#students section *")) {
      const node = ev.target.closest("#students section");
      ev.dataTransfer.setData("text/plain", node.id);
    }
  });
  studentsEl.addEventListener("dragenter", (ev) => {
    if (ev.target.matches("#students section *")) {
      ev.preventDefault();
    }
  });
  studentsEl.addEventListener("dragover", (ev) => {
    if (ev.target.matches("#students section *")) {
      ev.preventDefault();
    }
  });
  studentsEl.addEventListener("drop", (ev) => {
    if (ev.target.matches("#students section *")) {
      const target = ev.target.closest("section");
      const sourceId = ev.dataTransfer.getData("text/plain");
      if (sourceId != target.id) {
        const source = document.getElementById(sourceId);
        const studentsEl = document.getElementById("students");
        const indexOf = [].indexOf.bind(studentsEl.children);
        const sourcePosition = indexOf(source);
        const targetPosition = indexOf(target);
        const position = sourcePosition < targetPosition ? 'afterend' : 'beforebegin';
        target.insertAdjacentElement(position, source);
        ev.preventDefault();
      }
    }
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
  const results = dataRows.map(([name, _a, id, email]) => ({
    name,
    email,
    id,
  }));
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
  const idRow = columnTitles.indexOf("Student ID");
  const rows = el.querySelectorAll("tbody tr");
  const results = [];
  for (const r of rows) {
    const name = r.querySelector(`td:nth-child(${nameRow + 1})`).textContent;
    const email = r.querySelector(`td:nth-child(${emailRow + 1})`).textContent;
    const id = r.querySelector(`td:nth-child(${idRow + 1})`).textContent;
    results.push({ name, email, id });
  }
  createPageFrom(results);
}

function createPageFrom(results) {
  const studentsEl = document.querySelector("#students");
  studentsEl.innerHTML = "";
  for (const { name, email, id } of results) {
    const login = email.replace("@hanover.edu", "");
    const [last, firstNames] = name.split(/(?:\,\s+)/g);
    const [first, middle] = firstNames.split(/\s+/);
    const imgLinkOld = `https://my.hanover.edu/icsfileserver/icsphotos/${login}.jpg`;
    const fullName = `${first} ${last}`;
    const html = makeStudentEntry({ id, name: fullName });
    studentsEl.insertAdjacentHTML("beforeend", html);
  }
}

function makeStudentEntry({ id, name }) {
  const imgLink = `https://websites.hanover.edu/idphotos/${id}.jpg`;
  return `<section id="student-${id}" draggable="true"><button class="delete">X</button><img src="${imgLink}" /><h2 contenteditable="true">${name}</h2></section>`;
}

function addStudentFromId() {
  const id = document.getElementById("studentId").value;
  const studentsEl = document.getElementById("students");
  const html = makeStudentEntry({ id, name: "Type name here" });
  studentsEl.insertAdjacentHTML("beforeend", html);
}
