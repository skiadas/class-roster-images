window.addEventListener("DOMContentLoaded", () => {
  const fileSelector = document.getElementById("file-selector");
  fileSelector.addEventListener("change", (event) => {
    const fileList = event.target.files;
    if (fileList.length > 0) {
      process(fileList[0]);
    }
  });
  document.getElementById("include-title").addEventListener("change", (event) => {
    const h1 = document.querySelector("h1");
    if (event.target.checked) {
      h1.removeAttribute("hidden");
    } else {
      h1.setAttribute("hidden", "true");
    }
  });
});

function process(file) {
  file.text().then((data) => {
    const el = document.createElement("html");
    el.innerHTML = data;
    const rows = el.querySelectorAll("tbody tr");
    const results = [];
    for (const r of rows) {
      const name = r.querySelector("td:nth-child(3)").textContent;
      const email = r.querySelector("td:nth-child(5)").textContent;
      results.push({ name, email });
    }
    createPageFrom(results);
  });
}

function createPageFrom(results) {
  const studentsEl = document.querySelector("#students");
  studentsEl.innerHTML = "";
  for (const { name, email } of results) {
    const login = email.replace("@hanover.edu", "");
    const [last, first, middle] = name.split(/[, ]+/g);
    const imgLink = `https://my.hanover.edu/icsfileserver/icsphotos/${login}.jpg`;
    const html = `<section><img src="${imgLink}" /><h2>${first} ${last}</h2></section>`;
    studentsEl.insertAdjacentHTML('beforeend', html);
  }
}
