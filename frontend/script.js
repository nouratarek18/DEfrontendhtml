const fileInput = document.getElementById("fileInput");
const previewTable = document.getElementById("previewTable");
const taskSelect = document.getElementById("task");
const targetContainer = document.getElementById("targetContainer");
const targetSelect = document.getElementById("target");
const submitBtn = document.getElementById("submitBtn");

let columns = [];
let file = null;

//uploadfile
fileInput.addEventListener("change", function () {
  file = this.files[0];

  if (file.name.endsWith(".csv")) {
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        displayPreview(results.data);
      },
    });
  } else if (file.name.endsWith(".xlsx")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      displayPreview(data);
    };
    reader.readAsBinaryString(file);
  }
});

function displayPreview(data) {
  previewTable.innerHTML = "";

  const preview = data.slice(0, 5); //5
  columns = Object.keys(preview[0]);

  let headerRow = "<tr>";
  columns.forEach(col => headerRow += `<th>${col}</th>`);
  headerRow += "</tr>";
  previewTable.innerHTML += headerRow;
//row
  preview.forEach(row => {
    let rowHTML = "<tr>";
    columns.forEach(col => rowHTML += `<td>${row[col]}</td>`);
    rowHTML += "</tr>";
    previewTable.innerHTML += rowHTML;
  });

  // Fill target dropdown
  targetSelect.innerHTML = "";
  columns.forEach(col => {
    targetSelect.innerHTML += `<option value="${col}">${col}</option>`;
  });
}

//selecttask
taskSelect.addEventListener("change", function () {
  if (this.value === "classification" || this.value === "regression") {
    targetContainer.style.display = "block";
  } else {
    targetContainer.style.display = "none";
  }
});

//submit
submitBtn.addEventListener("click", function () {
  if (!file || !taskSelect.value) {
    alert("Upload file and select task first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("task", taskSelect.value);
  formData.append("target", targetSelect.value);

  fetch("http://127.0.0.1:8000/train", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      alert("Training started!");
    })
    .catch(err => {
      console.error(err);
      alert("Error connecting to backend");
    });
});
