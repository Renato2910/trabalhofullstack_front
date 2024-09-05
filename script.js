let editMode = false;
let currentPersonId = null;

document
  .getElementById("formPessoa")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;

    const personData = {
      Nome: nome,
      Cpf: cpf,
      Telefone: telefone,
    };

    try {
      let url = "http://localhost:3000/api/pessoas";
      let method = "POST";

      if (editMode) {
        url = `http://localhost:3000/api/pessoas/${currentPersonId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personData),
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById("message").innerText = editMode
          ? "Pessoa atualizada com sucesso!"
          : "Pessoa enviada com sucesso!";
        document.getElementById("formPessoa").reset();
        loadPessoas();

        setTimeout(() => {
          document.getElementById("message").innerText = "";
        }, 5000);

        editMode = false;
        currentPersonId = null;
      } else {
        document.getElementById("message").innerText = `Erro: ${
          result.error || result.message || "Desconhecido"
        }`;
      }
    } catch (error) {
      document.getElementById("message").innerText =
        "Erro na comunicação com o servidor.";
    }
  });

async function loadPessoas() {
  try {
    const response = await fetch("http://localhost:3000/api/pessoas");
    const pessoas = await response.json();

    const tableBody = document.querySelector("#pessoasTable tbody");
    tableBody.innerHTML = "";

    pessoas.forEach((person) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td class="border p-2">${person.Nome}</td>
              <td class="border p-2">${person.Cpf}</td>
              <td class="border p-2">${person.Telefone}</td>
              <td class="border p-2 text-center">
                <button class="edit-btn" data-id="${person.Id}">
                  ✏️ <!-- Ícone de caneta -->
                </button>
                <button class="delete-btn" data-id="${person.Id}">
                  🗑️ <!-- Ícone de lixeira -->
                </button>
              </td>
            `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });
  } catch (error) {
    console.error("Erro ao carregar pessoas:", error);
  }
}

function handleEdit(event) {
  const personId = event.target.dataset.id;
  currentPersonId = personId;
  editMode = true;

  fetch(`http://localhost:3000/api/pessoas/${personId}`)
    .then((response) => response.json())
    .then((person) => {
      document.getElementById("nome").value = person.Nome;
      document.getElementById("cpf").value = person.Cpf;
      document.getElementById("telefone").value = person.Telefone;
    })
    .catch((error) => {
      console.error("Erro ao carregar dados da pessoa:", error);
    });
}

async function handleDelete(event) {
  const personId = event.target.dataset.id;

  if (confirm("Tem certeza que deseja excluir esta pessoa?")) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/pessoas/${personId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        loadPessoas();
        document.getElementById("message").innerText =
          "Pessoa excluída com sucesso!";
        setTimeout(() => {
          document.getElementById("message").innerText = "";
        }, 5000);
      } else {
        const result = await response.json();
        document.getElementById("message").innerText = `Erro: ${
          result.error || result.message || "Desconhecido"
        }`;
      }
    } catch (error) {
      console.error("Erro ao excluir pessoa:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", loadPessoas);
