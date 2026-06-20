(function checkLogin() {
  try {
    const currentUser = localStorage.getItem("currentUser");
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    // aceita o login do React (`currentUser`) ou a flag legada `usuarioLogado`
    if (currentUser || usuarioLogado === "true") return;
  } catch (e) {
    // falha ao acessar localStorage — seguirá para o login
  }

  // Redireciona para a rota de login do React (fallback se necessário)
  window.location.href = "/login";
})();

let bancoDeDadosLocal = { trilhas: [], cachoeiras: [] };
let edicaoAtual = null;

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function gerarSlug(text) {
  return String(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function atualizarSlug() {
  const nome = document.getElementById("nome").value;
  const slugInput = document.getElementById("slug");
  if (!slugInput.value.trim() && nome.trim()) {
    slugInput.value = gerarSlug(nome);
  }
}

function normalizeParkName(parque) {
  return String(parque || "")
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getAdminParkValue(parque) {
  const norm = normalizeParkName(parque);
  if (norm.includes("serra dos orgaos") || norm.includes("parque nacional da serra dos orgaos"))
    return "Serra dos Órgãos";
  if (norm.includes("tres picos") || norm.includes("3 picos") || norm.includes("parque estadual dos tres picos"))
    return "Três Picos";
  if (norm.includes("montanhas de tere") || norm.includes("montanhas de teresopolis") || norm.includes("parque natural municipal montanhas de teresopolis"))
    return "Montanhas de Terê";
  return String(parque || "").trim();
}

async function carregarTabelas() {
  try {
    const response = await fetch("/api/locais-divididos");
    const dados = await response.json();
    bancoDeDadosLocal = dados;

    document.getElementById("tabela-serra-orgaos").innerHTML = "";
    document.getElementById("tabela-tres-picos").innerHTML = "";
    document.getElementById("tabela-montanhas-tere").innerHTML = "";

    organizarPorParques(dados.trilhas, "trilhas");
    organizarPorParques(dados.cachoeiras, "cachoeiras");

    verificarTabelasVazias();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

function organizarPorParques(lista, categoria) {
  if (!lista) return;

  lista.forEach((item, index) => {
    const parkName = getAdminParkValue(item.parque);
    let idTabela = "";

    if (parkName === "Serra dos Órgãos") idTabela = "tabela-serra-orgaos";
    else if (parkName === "Três Picos") idTabela = "tabela-tres-picos";
    else if (parkName === "Montanhas de Terê") idTabela = "tabela-montanhas-tere";

    if (idTabela) {
      const tbody = document.getElementById(idTabela);
      const iconeTipo = categoria === "trilhas" ? "🥾 Trilha" : "🌊 Cachoeira";
      const tempoEstimado = item.duracao || "Não informado";
      const imagemCell = item.imagem
        ? `<img src="${escapeJsString(item.imagem)}" alt="${escapeJsString(item.nome)}" style="width: 80px; height: 48px; object-fit: cover; border-radius: 6px;" />`
        : '<span style="color:#999; font-size: 14px;">Sem imagem</span>';

      tbody.innerHTML += `
                <tr>
                    <td><strong>${item.nome}</strong></td>
                    <td>${imagemCell}</td>
                    <td><span style="color: #666; font-size: 14px;">${iconeTipo}</span></td>
                    <td><span class="tag-dif">${item.dificuldade}</span></td>
                    <td><span style="color: #555; font-size: 14px;">⏱️ ${tempoEstimado}</span></td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicao('${categoria}', ${index})">Editar</button>
                        <button class="btn-delete" onclick="excluirLocal('${categoria}', ${item.id}, '${escapeJsString(item.nome)}')">Excluir</button>
                    </td>
                </tr>
            `;
    }
  });
}

function verificarTabelasVazias() {
  const tabelas = [
    "tabela-serra-orgaos",
    "tabela-tres-picos",
    "tabela-montanhas-tere",
  ];
  tabelas.forEach((id) => {
    const tbody = document.getElementById(id);
    if (tbody.innerHTML.trim() === "") {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; color:#999; padding: 10px;">Nenhum local cadastrado neste parque.</td></tr>';
    }
  });
}

function prepararEdicao(categoria, indice) {
  const item = bancoDeDadosLocal[categoria][indice];
  if (item) {
    document.getElementById("nome").value = item.nome;
    document.getElementById("slug").value = item.slug || "";
    document.getElementById("parque").value = getAdminParkValue(item.parque);
    document.getElementById("categoria").value = categoria;
    document.getElementById("dificuldade").value = item.dificuldade;
    document.getElementById("duracao").value = item.duracao || "";
    document.getElementById("imagem").value = item.imagem || "";
    document.getElementById("imagens").value = item.images ? item.images.join(", ") : "";
    document.getElementById("descricao").value = item.descricao;
    atualizarPreviewImagem();
    edicaoAtual = { categoria, id: item.id };
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.innerText = "Atualizar Dados";
    btnSubmit.style.backgroundColor = "#0288d1";

    document.getElementById("btn-cancelar").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function cancelarEdicao() {
  document.getElementById("admin-form").reset();
  edicaoAtual = null;
  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.innerText = "Salvar Local";
  btnSubmit.style.backgroundColor = "#2e7d32";
  document.getElementById("btn-cancelar").style.display = "none";
  // esconder preview
  const previewContainer = document.getElementById("imagem-preview-container");
  if (previewContainer) previewContainer.style.display = "none";
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function atualizarPreviewImagem() {
  const valor = document.getElementById("imagem").value.trim();
  const preview = document.getElementById("imagem-preview");
  const container = document.getElementById("imagem-preview-container");
  if (!preview || !container) return;

  if (valor && isValidUrl(valor)) {
    preview.src = valor;
    container.style.display = "block";
  } else {
    preview.src = "";
    container.style.display = "none";
  }
}

async function salvarLocal(event) {
  event.preventDefault();
  const dadosForm = {
    nome: document.getElementById("nome").value,
    slug: document.getElementById("slug").value,
    parque: document.getElementById("parque").value,
    categoria: document.getElementById("categoria").value,
    dificuldade: document.getElementById("dificuldade").value,
    duracao: document.getElementById("duracao").value,
    mainImage: document.getElementById("imagem").value,
    images: document.getElementById("imagens").value,
    descricao: document.getElementById("descricao").value,
  };

  try {
    if (edicaoAtual) {
      if (dadosForm.categoria === edicaoAtual.categoria) {
        const response = await fetch(
          `/api/locais/${edicaoAtual.categoria}/${edicaoAtual.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosForm),
          },
        );

        if (!response.ok) throw new Error("Erro ao atualizar local");
      } else {
        const deleteResponse = await fetch(
          `/api/locais/${edicaoAtual.categoria}/${edicaoAtual.id}`,
          {
            method: "DELETE",
          },
        );

        if (!deleteResponse.ok)
          throw new Error("Erro ao mover local para nova categoria");

        const createResponse = await fetch("/api/locais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosForm),
        });

        if (!createResponse.ok)
          throw new Error("Erro ao recriar local na nova categoria");
      }
    } else {
      const response = await fetch("/api/locais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosForm),
      });

      if (!response.ok) throw new Error("Erro ao salvar local");
    }

    cancelarEdicao();
    carregarTabelas();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar ou atualizar local. Verifique o console.");
  }
}

async function excluirLocal(categoria, id, nome) {
  if (!id) return;

  if (confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
    try {
      const response = await fetch(`/api/locais/${categoria}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        carregarTabelas();
      } else {
        alert("Erro ao excluir");
      }
    } catch (erro) {
      console.error(erro);
    }
  }
}

window.onload = () => {
  document.getElementById("nome").addEventListener("input", atualizarSlug);
  document.getElementById("imagem").addEventListener("input", atualizarPreviewImagem);
  carregarTabelas();
};
