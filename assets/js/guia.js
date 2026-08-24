function normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function filtrarBiblioteca() {
    const campo = document.getElementById("campo-busca-biblioteca");
    const resultado = document.getElementById("resultado-busca-biblioteca");
    const cards = document.querySelectorAll(".card-biblioteca");

    if (!campo || !resultado || cards.length === 0) {
      return;
    }

    let texto = normalizarTexto(campo.value);

    const sinonimos = {
      "pa": "pa",
      "pas": "pa eolica",
      "pa eolica": "pa eolica",
      "pas eolica": "pa eolica",
      "pas eolicas": "pa eolica",
      "eolica": "eolica",
      "eolicas": "eolica",
      "helice": "eolica",
      "helices": "eolica",
      "maquina": "maquina",
      "maquinas": "maquina",
      "maquinas pesadas": "maquina pesada",
      "carga alta": "altura",
      "carga longa": "comprimento",
      "carga pesada": "peso",
      "super pesado": "superpesado",
      "super pesada": "superpesada",
      "superpesados": "superpesado",
      "superpesadas": "superpesada"
    };

    if (sinonimos[texto]) {
      texto = sinonimos[texto];
    }

    if (texto === "") {
      cards.forEach((card) => {
        card.style.display = "block";
      });

      resultado.textContent = "Pesquise veículos, conceitos operacionais e aplicações.";
      return;
    }

    let encontrados = 0;

    cards.forEach((card) => {
      const titulo = card.querySelector("h2") ? card.querySelector("h2").innerText : "";
      const tags = card.dataset.tags || "";
      const conteudoBusca = normalizarTexto(`${titulo} ${tags}`);

      const encontrou =
        texto.length <= 2
          ? conteudoBusca.split(/\s+/).includes(texto)
          : conteudoBusca.includes(texto);

      if (encontrou) {
        card.style.display = "block";
        encontrados++;
      } else {
        card.style.display = "none";
      }
    });

    resultado.innerHTML =
      encontrados === 1
        ? "🔎 1 veículo encontrado."
        : `🔎 ${encontrados} veículos encontrados.`;
  }

  function filtrarCategoria(categoria, botaoClicado) {
  const cards = document.querySelectorAll(".card-biblioteca");
  const botoes = document.querySelectorAll(".btn-filtro");
  const resultado = document.getElementById("resultado-busca-biblioteca");
  const campoBusca = document.getElementById("campo-busca-biblioteca");

  botoes.forEach((botao) => {
    botao.classList.remove("ativo");
  });

  if (botaoClicado) {
    botaoClicado.classList.add("ativo");
  }

  if (campoBusca) {
    campoBusca.value = "";
  }

  let encontrados = 0;

  cards.forEach((card) => {
    const categoriasCard = (card.dataset.categoria || "")
      .split(" ")
      .filter(Boolean);

    const deveMostrar =
      categoria === "todos" ||
      categoriasCard.includes(categoria);

    card.style.display = deveMostrar ? "block" : "none";

    if (deveMostrar) {
      encontrados++;
    }
  });

  if (!resultado) {
    return;
  }

  if (categoria === "todos") {
    resultado.textContent = "Pesquise veículos, conceitos operacionais e aplicações.";
    return;
  }

  resultado.textContent =
    encontrados === 1
      ? "🔎 1 veículo encontrado nesta categoria."
      : `🔎 ${encontrados} veículos encontrados nesta categoria.`;
}
    
  function toggleDetalhes(botao) {
    const detalhes = botao.nextElementSibling;

    if (detalhes.style.display === "block") {
      detalhes.style.display = "none";
      botao.textContent = "🔎 Ver ficha completa";
    } else {
      detalhes.style.display = "block";
      botao.textContent = "Ocultar ficha completa";
    }
  }
  
  

let indiceConceitoAtual = 0;

function togglePainelConceitos() {
  const painel = document.getElementById("painel-conceitos");

  if (painel.style.display === "block") {
    painel.style.display = "none";
  } else {
    painel.style.display = "block";
    renderizarConceito();
  }
}

function mudarConceito(direcao) {
  indiceConceitoAtual += direcao;

  if (indiceConceitoAtual < 0) {
    indiceConceitoAtual = conceitosDCPRO.length - 1;
  }

  if (indiceConceitoAtual >= conceitosDCPRO.length) {
    indiceConceitoAtual = 0;
  }

  renderizarConceito();
}

function abrirConceito(id) {
  const indiceEncontrado = conceitosDCPRO.findIndex(
    (conceito) => conceito.id === id
  );

  if (indiceEncontrado === -1) {
    return;
  }

  indiceConceitoAtual = indiceEncontrado;

  const painel = document.getElementById("painel-conceitos");

  if (painel) {
    painel.style.display = "block";
  }

  renderizarConceito();

  if (painel) {
    painel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function renderizarConceito() {
  const conceito = conceitosDCPRO[indiceConceitoAtual];

  const titulo = document.getElementById("titulo-conceito");
  const contador = document.getElementById("contador-conceito");
  const conteudo = document.getElementById("conteudo-conceito");

  if (!conceito || !titulo || !contador || !conteudo) {
    return;
  }

  titulo.innerText = conceito.titulo;

  contador.innerText =
    `${indiceConceitoAtual + 1} / ${conceitosDCPRO.length}`;

  let html = conceito.html;

  html = html.replace(
    /🔗 Conceitos relacionados<\/strong><br>\s*([\s\S]*?)<\/p>/,
    function (match, lista) {
      const links = lista
        .split("•")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => {
          const id = item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");

          const conceitoExiste = conceitosDCPRO.some(
            (conceito) => conceito.id === id
          );

          if (!conceitoExiste) {
            return item;
          }

          return `<a href="#" onclick="abrirConceito('${id}'); return false;">${item}</a>`;
        })
        .join(" • ");

      return `🔗 Conceitos relacionados</strong><br>${links}</p>`;
    }
  );

  conteudo.innerHTML = html;
  conteudo.scrollTop = 0;
}

function mostrarModoGuia(modo, botaoClicado) {
  const conceitos = document.querySelector(".conceitos-operacionais");
  const painelConceitos = document.getElementById("painel-conceitos");
  const veiculos = document.querySelectorAll(".card-biblioteca");

  document.querySelectorAll(".btn-modo").forEach((botao) => {
    botao.classList.remove("ativo");
  });

  botaoClicado.classList.add("ativo");

  if (modo === "todos") {
    if (conceitos) conceitos.style.display = "block";
    if (painelConceitos) painelConceitos.style.display = "none";

    veiculos.forEach((card) => {
      card.style.display = "block";
    });

    return;
  }

  if (modo === "conceitos") {
    if (conceitos) conceitos.style.display = "block";
    if (painelConceitos) {
      painelConceitos.style.display = "block";
      renderizarConceito();
    }

    veiculos.forEach((card) => {
      card.style.display = "none";
    });

    return;
  }

  if (modo === "veiculos") {
    if (conceitos) conceitos.style.display = "none";

    veiculos.forEach((card) => {
      card.style.display = "block";
    });
  }
} 

document.addEventListener("DOMContentLoaded", () => {
  const parametros = new URLSearchParams(window.location.search);

  const conceitoRecebido = parametros.get("conceito");
  const veiculoRecebido = parametros.get("veiculo");

  if (veiculoRecebido) {
    const card = document.getElementById(`veiculo-${veiculoRecebido}`);

    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      const botao = card.querySelector(".btn-detalhes");

      if (botao) {
        botao.click();
      }

      return;
    }
  }

  if (!conceitoRecebido) {
    return;
  }

  const conceitoExiste = conceitosDCPRO.some(
    (conceito) => conceito.id === conceitoRecebido,
  );

  if (!conceitoExiste) {
    return;
  }

  const secaoConceitos = document.getElementById("secao-conceitos");
  const painelConceitos = document.getElementById("painel-conceitos");
  const cardsVeiculos = document.querySelectorAll(".card-biblioteca");
  const botoesModo = document.querySelectorAll(".btn-modo");

  botoesModo.forEach((botao) => {
    botao.classList.remove("ativo");
  });

  const botaoConceitos = Array.from(botoesModo).find((botao) =>
    botao.textContent.includes("Conceitos"),
  );

  if (botaoConceitos) {
    botaoConceitos.classList.add("ativo");
  }

  if (secaoConceitos) {
    secaoConceitos.style.display = "block";
  }

  if (painelConceitos) {
    painelConceitos.style.display = "block";
  }

  cardsVeiculos.forEach((card) => {
    card.style.display = "none";
  });

  abrirConceito(conceitoRecebido);
});