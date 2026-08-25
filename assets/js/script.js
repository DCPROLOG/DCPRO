// =====================================================
// DCPRO - Dimensionador de Carga Pro
// Versão: 1.2 BETA
// Arquivo: script.js
// =====================================================

// =====================================================
// CONFIGURAÇÕES GLOBAIS
// =====================================================
let ultimaFrotaCalculada = [];

const coresItens = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#ef4444",
  "#a855f7",
  "#6366f1",
  "#84cc16",
  "#059669",
  "#d946ef",
  "#b45309",
  "#0284c7",
  "#4d7c0f",
  "#be123c",
  "#6d28d9",
  "#1e40af",
];
let globalEstorouMetragem = false;
let globalItensExcedentes = [];
let trocaAutomaticaVeiculo = false;
let avisoTrocaVeiculo = null;
let alertaOperacionalAET = null;
let ressalvaCgAtual = null;
let mensagemTransversalCgAtual = null;
let orientacaoLongitudinalCgAtual = null;

// =====================================================
// BANCO DE VEÍCULOS
// =====================================================

const dbVeiculos = [
  {
    nome: "Fiorino",
    pesoMax: 650,
    volMax: 1.70 * 1.05 * 1.34,
    compFisico: 1.70,
    largFisica: 1.05,
    altFisica: 1.34,
  },

  {
    nome: "Urbanos / Vans",
    pesoMax: 1450,
    volMax: 2.60 * 1.35 * 1.70,
    compFisico: 2.60,
    largFisica: 1.35,
    altFisica: 1.70,
  },

  {
    nome: "VUC / 3/4",
    pesoMax: 3500,
    volMax: 4.50 * 2.20 * 2.20,
    compFisico: 4.50,
    largFisica: 2.20,
    altFisica: 2.20,
  },

  {
    nome: "Caminhão Toco",
    pesoMax: 6000,
    volMax: 6.50 * 2.40 * 2.50,
    compFisico: 6.50,
    largFisica: 2.40,
    altFisica: 2.50,
  },

  {
    nome: "Caminhão Truck",
    pesoMax: 14000,
    volMax: 8.50 * 2.40 * 2.60,
    compFisico: 8.50,
    largFisica: 2.40,
    altFisica: 2.60,
  },

  {
    nome: "Carreta 3 Eixos",
    pesoMax: 25000,
    volMax: 13.50 * 2.45 * 3.00,
    compFisico: 13.50,
    largFisica: 2.45,
    altFisica: 3.00,
  },
];

// =====================================================
// UTILIDADES
// =====================================================

function formatarBR(valor) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// =====================================================
// INTERFACE (UI)
// =====================================================

function atualizarLabelsEcores() {
  const lines = document.querySelectorAll("#tabela-carga tbody tr");
  lines.forEach((linha, index) => {
    const inlineLabel = linha.querySelector(".label-linha");
    const cor = coresItens[index % coresItens.length];
    if (inlineLabel) {
      inlineLabel.innerText = `Item ${index + 1}`;
      inlineLabel.style.backgroundColor = cor;
    }
  });
}

function validarNumeros(input) {
  input.value = input.value.replace(/[^0-9.,]/g, "");
  let partes = input.value.split(/[.,]/);
  if (partes.length > 2) {
    input.value = partes[0] + "." + partes.slice(1).join("");
  }
}

// =====================================================
// TABELA DE CARGA
// =====================================================

function adicionarLinha(salvar = true) {
  const tabela = document
    .getElementById("tabela-carga")
    .getElementsByTagName("tbody")[0];
  const novaLinha = tabela.insertRow();

  novaLinha.innerHTML = `
        <td><span class="label-linha">Item</span></td>
        <td><input type="text" placeholder="Ex: Caixa A" class="nome"></td>
        <td><input type="number" class="qtd" value="1" min="1" oninput="validarNumeros(this)"></td>
        <td><input type="text" class="comp" placeholder="CM" oninput="validarNumeros(this)"></td>
        <td><input type="text" class="larg" placeholder="CM" oninput="validarNumeros(this)"></td>
        <td><input type="text" class="alt" placeholder="CM" oninput="validarNumeros(this)"></td>
        <td><input type="text" class="peso" placeholder="KG" oninput="validarNumeros(this)"></td>
        <td>     <button class="btn-danger" onclick="deletarLinha(this)" title="Excluir item">         <i class="fa-solid fa-xmark"></i>     </button> </td>
    `;

  novaLinha.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", salvarCarga);
  });

  atualizarLabelsEcores();

  if (salvar) {
    salvarCarga();
  }
}
function deletarLinha(botao) {
  botao.parentNode.parentNode.remove();

  atualizarLabelsEcores();
  calcularCarga();
  salvarCarga();
}

// =====================================================
// VALIDAÇÕES
// =====================================================

function verificarItensIncompletos() {
  let incompleto = false;

  document.querySelectorAll("#tabela-carga tbody tr").forEach(function (tr) {
    const qtdEl = tr.querySelector(".qtd");
    const compEl = tr.querySelector(".comp");
    const largEl = tr.querySelector(".larg");
    const altEl = tr.querySelector(".alt");
    const pesoEl = tr.querySelector(".peso");

    if (!qtdEl || !compEl || !largEl || !altEl || !pesoEl) return;

    const qtdVal = parseInt(qtdEl.value) || 0;
    const compVal = parseFloat(compEl.value.replace(",", ".")) || 0;
    const largVal = parseFloat(largEl.value.replace(",", ".")) || 0;
    const altVal = parseFloat(altEl.value.replace(",", ".")) || 0;
    const pesoVal =
      Number(pesoEl.value.replace(/\./g, "").replace(",", ".")) || 0;

    if (
      qtdVal <= 0 ||
      compVal <= 0 ||
      largVal <= 0 ||
      altVal <= 0 ||
      pesoVal <= 0
    ) {
      incompleto = true;
    }
  });

  const aviso = document.getElementById("avisoItensIncompletos");

  if (aviso) {
    aviso.style.display = incompleto ? "block" : "none";
  }

  return incompleto;
}

// =====================================================
// CÁLCULOS
// =====================================================

function estimarComprimentoLinear(itens, veiculo) {
  let comprimentoTotal = 0;

  itens.forEach((item) => {
    const nome = item.nome.toLowerCase();

    const ehPalletOuBase =
      nome.includes("pallet") ||
      nome.includes("palete") ||
      nome.includes("base");

    let limiteEmpilhamento = item.alt <= 0.8 ? 3 : 2;

    if (ehPalletOuBase) {
      limiteEmpilhamento = 1;
    }

    let limiteFisico = Math.floor(veiculo.altFisica / item.alt);

    if (limiteFisico < 1) {
      limiteFisico = 1;
    }

    const maxEmpilhamento = Math.min(limiteEmpilhamento, limiteFisico);

    const blocos = Math.ceil(item.qtd / maxEmpilhamento);

    const porFileira = Math.max(1, Math.floor(veiculo.largFisica / item.larg));

    const fileiras = Math.ceil(blocos / porFileira);

    comprimentoTotal += fileiras * item.comp;
  });

  return comprimentoTotal;
}

// =====================================================
// C3 — MARGEM OPERACIONAL DE PESO
// =====================================================

function obterLimiteOperacionalPeso(veiculo) {
  if (!veiculo || !veiculo.pesoMax) {
    return 0;
  }

  return veiculo.pesoMax * 0.95;
}

function estaDentroMargemOperacionalPeso(peso, veiculo) {
  if (!veiculo || !veiculo.pesoMax) {
    return false;
  }

  return peso < obterLimiteOperacionalPeso(veiculo);
}

function escolherVeiculoIdeal(
  peso,
  volume,
  maiorComp,
  maiorLarg,
  maiorAlt,
  itens = null,
) {
  for (const veiculo of dbVeiculos) {
    const volumeMaximo =
      veiculo.compFisico * veiculo.largFisica * veiculo.altFisica;

    let areaOk = true;
    let comprimentoOk = true;

const excessoAceitoOperacionalmente =
  maiorComp <= veiculo.compFisico &&
  (
    maiorLarg > veiculo.largFisica ||
    maiorAlt > veiculo.altFisica
  );

    if (itens) {
      const areaPiso = calcularAreaPisoEstimada(itens, veiculo);

      const areaMaxima = veiculo.compFisico * veiculo.largFisica;

      areaOk =
  areaPiso <= areaMaxima * 0.95 ||
  excessoAceitoOperacionalmente;

      /*
  A validação real do comprimento será feita pela
  arrumação física, que considera itens lado a lado,
  rotação e espaços disponíveis no veículo.
*/
comprimentoOk = true;
    }

    if (
      peso <= veiculo.pesoMax &&
      volume <= volumeMaximo &&
      areaOk &&
      comprimentoOk &&
      maiorComp <= veiculo.compFisico &&
      (maiorLarg <= veiculo.largFisica || excessoAceitoOperacionalmente) &&
(maiorAlt <= veiculo.altFisica || excessoAceitoOperacionalmente)
    ) {
      return veiculo;
    }
  }

  return dbVeiculos[dbVeiculos.length - 1];
}

// =====================================================
// AGRUPAR UNIDADES IGUAIS PARA TESTE DE EMPILHAMENTO
// =====================================================

function agruparItensParaEmpilhamento(itens) {
  const grupos = {};

  itens.forEach((item) => {
    const nomeMinusculo = String(item.nome || "").toLowerCase();

    const ehPalletOuBase =
      nomeMinusculo.includes("pallet") ||
      nomeMinusculo.includes("palete") ||
      nomeMinusculo.includes("base");

    // Base e palete continuam individuais.
    // Para os demais volumes, a compatibilidade física
    // para empilhamento é determinada pelas dimensões.
const chave = ehPalletOuBase
  ? `individual|${item.id}`
  : [
      Number(item.comp).toFixed(4),
      Number(item.larg).toFixed(4),
    ].join("|");

    if (!grupos[chave]) {
      grupos[chave] = {
        comp: item.comp,
        larg: item.larg,
        alt: item.alt,

        ehPalletOuBase,

        unidades: [],
        qtd: 0,
      };
    }

    const quantidade = Number(item.qtd) || 1;

    for (let i = 0; i < quantidade; i++) {
grupos[chave].unidades.push({
  id: item.id,
  nome: item.nome,
  alt: Number(item.alt) || 0,
  peso: Number(item.peso) || 0,
  cor: item.cor,
});
    }

    grupos[chave].qtd += quantidade;
  });

  // Dentro de uma futura pilha:
  // unidade mais pesada primeiro = parte inferior.
  Object.values(grupos).forEach((grupo) => {
    grupo.unidades.sort(
      (a, b) => b.peso - a.peso
    );
  });

  return Object.values(grupos);
}

function criarViagem(veiculo) {
  return {
    veiculo: veiculo,

    itens: [],

    pesoAtual: 0,

    volumeAtual: 0,

    areaAtual: 0,

    comprimentoUsado: 0,

    maiorComprimento: 0,

    maiorLargura: 0,

    maiorAltura: 0,
  };
}

function calcularAreaPisoEstimada(itens, veiculo) {
    if (!veiculo) {
    return 0;
  }

  let area = 0;

const itensAgrupados =
  agruparItensParaEmpilhamento(itens);

itensAgrupados.forEach((grupo) => {

  // Base e palete continuam ocupando
  // uma posição individual no piso.
  if (grupo.ehPalletOuBase) {
    area +=
      grupo.comp *
      grupo.larg *
      grupo.qtd;

    return;
  }

  // =====================================================
  // EMPILHAMENTO COM ALTURAS VARIÁVEIS
  //
  // Caixas com a mesma base física podem compartilhar
  // uma pilha mesmo possuindo alturas diferentes.
  //
  // Regras:
  // - máximo de 3 unidades quando todas têm até 0,80 m;
  // - se houver unidade acima de 0,80 m na pilha,
  //   máximo de 2 unidades;
  // - soma das alturas nunca pode ultrapassar
  //   a altura útil do veículo.
  // =====================================================

  const unidades =
    [...grupo.unidades].sort(
      (a, b) => b.alt - a.alt
    );

  const pilhas = [];

  unidades.forEach((unidade) => {

    let pilhaEncontrada = null;

    for (const pilha of pilhas) {

      const possuiItemAlto =
        unidade.alt > 0.8 ||
        pilha.unidades.some(
          (u) => u.alt > 0.8
        );

      const limiteQuantidade =
        possuiItemAlto ? 2 : 3;

      const novaAltura =
        pilha.alturaTotal +
        unidade.alt;

      const cabePorQuantidade =
        pilha.unidades.length <
        limiteQuantidade;

      const cabePorAltura =
        novaAltura <=
        veiculo.altFisica + 0.01;

      if (
        cabePorQuantidade &&
        cabePorAltura
      ) {
        pilhaEncontrada = pilha;
        break;
      }
    }

    if (pilhaEncontrada) {

      pilhaEncontrada.unidades.push(
        unidade
      );

      pilhaEncontrada.alturaTotal +=
        unidade.alt;

    } else {

      pilhas.push({
        alturaTotal: unidade.alt,
        unidades: [unidade],
      });
    }
  });

  const blocosNoPiso =
    pilhas.length;

  area +=
    grupo.comp *
    grupo.larg *
    blocosNoPiso;
});

  return area;
}

function cargaCabeNoVeiculo(
  peso,
  volume,
  maiorComp,
  maiorLarg,
  maiorAlt,
  itens,
  veiculo,
) {
  const volumeMaximo =
    veiculo.compFisico * veiculo.largFisica * veiculo.altFisica;

  const areaMaxima = veiculo.compFisico * veiculo.largFisica;

  const areaPiso = calcularAreaPisoEstimada(itens, veiculo);

  const comprimentoEstimado = estimarComprimentoLinear(itens, veiculo);

  const larguraAceitaOperacionalmente =
  maiorComp <= veiculo.compFisico &&
  maiorLarg > veiculo.largFisica;

  return (
    peso <= veiculo.pesoMax &&
    volume <= volumeMaximo &&
    areaPiso <= areaMaxima * 0.95 &&
    comprimentoEstimado <= veiculo.compFisico * 0.95 &&
    maiorComp <= veiculo.compFisico &&
    (maiorLarg <= veiculo.largFisica || larguraAceitaOperacionalmente) &&
    maiorAlt <= veiculo.altFisica
  );
}

function testarArrumacaoFisica(veiculo, itens) {
  let caixasIndividuais = [];

const itensAgrupados =
  agruparItensParaEmpilhamento(itens);

itensAgrupados.forEach((grupo) => {

  // Base e palete continuam individuais.
  if (grupo.ehPalletOuBase) {

    for (let i = 0; i < grupo.qtd; i++) {
      caixasIndividuais.push({
        comp: grupo.comp,
        larg: grupo.larg,
        area: grupo.comp * grupo.larg,
      });
    }

    return;
  }

  // =====================================================
  // EMPILHAMENTO FÍSICO COM ALTURAS VARIÁVEIS
  // =====================================================

  const unidades =
    [...grupo.unidades].sort(
      (a, b) => b.alt - a.alt
    );

  const pilhas = [];

  unidades.forEach((unidade) => {

    let pilhaEncontrada = null;

    for (const pilha of pilhas) {

      const possuiItemAlto =
        unidade.alt > 0.8 ||
        pilha.unidades.some(
          (u) => u.alt > 0.8
        );

      const limiteQuantidade =
        possuiItemAlto ? 2 : 3;

      const novaAltura =
        pilha.alturaTotal +
        unidade.alt;

      const cabePorQuantidade =
        pilha.unidades.length <
        limiteQuantidade;

      const cabePorAltura =
        novaAltura <=
        veiculo.altFisica + 0.01;

      if (
        cabePorQuantidade &&
        cabePorAltura
      ) {
        pilhaEncontrada = pilha;
        break;
      }
    }

    if (pilhaEncontrada) {

      pilhaEncontrada.unidades.push(
        unidade
      );

      pilhaEncontrada.alturaTotal +=
        unidade.alt;

    } else {

      pilhas.push({
        alturaTotal: unidade.alt,
        unidades: [unidade],
      });
    }
  });

  pilhas.forEach(() => {

    caixasIndividuais.push({
      comp: grupo.comp,
      larg: grupo.larg,
      area: grupo.comp * grupo.larg,
    });

  });
});

  caixasIndividuais.sort((a, b) => b.comp - a.comp || b.area - a.area);

  let espacosLivres = [
    {
      x: 0,
      y: 0,
      comp: veiculo.compFisico,
      larg: veiculo.largFisica,
    },
  ];

  for (const caixa of caixasIndividuais) {
    let encaixou = false;

    for (let i = 0; i < espacosLivres.length; i++) {
      const espaco = espacosLivres[i];

      const cabeNormal =
  caixa.comp <= espaco.comp + 0.01 &&
  caixa.larg <= espaco.larg + 0.01;

if (cabeNormal) {
  const compReal = caixa.comp;
  const largReal = caixa.larg;

        const espacoDireita = {
          x: espaco.x + compReal,
          y: espaco.y,
          comp: espaco.comp - compReal,
          larg: espaco.larg,
        };

        const espacoCima = {
          x: espaco.x,
          y: espaco.y + largReal,
          comp: compReal,
          larg: espaco.larg - largReal,
        };

        espacosLivres.splice(i, 1);

        if (espacoDireita.comp > 0.01 && espacoDireita.larg > 0.01) {
          espacosLivres.push(espacoDireita);
        }

        if (espacoCima.comp > 0.01 && espacoCima.larg > 0.01) {
          espacosLivres.push(espacoCima);
        }

        espacosLivres.sort((a, b) => a.x - b.x || a.y - b.y);

        encaixou = true;
        break;
      }
    }

    if (!encaixou) return false;
  }

  return true;
}

function obterMaioresDimensoes(itens) {
  let maiorComp = 0;
  let maiorLarg = 0;
  let maiorAlt = 0;

  itens.forEach((item) => {
    maiorComp = Math.max(maiorComp, item.comp);
    maiorLarg = Math.max(maiorLarg, item.larg);
    maiorAlt = Math.max(maiorAlt, item.alt);
  });

  return {
    maiorComp,
    maiorLarg,
    maiorAlt,
  };
}



function encontrarVeiculoComArrumacao(indiceInicial, itens) {
  let indiceVeiculo = indiceInicial;

  if (indiceVeiculo < 0) {
    indiceVeiculo = 0;
  }

  while (indiceVeiculo < dbVeiculos.length) {

    const veiculoAtual = dbVeiculos[indiceVeiculo];
    
    // Cabe normalmente
    if (testarArrumacaoFisica(veiculoAtual, itens)) {
      return veiculoAtual;
    }

    // Verifica se o único problema é excesso lateral (AET)
    let somenteLargura = true;

    for (const item of itens) {

      if (item.comp > veiculoAtual.compFisico) {
        somenteLargura = false;
        break;
      }

      if (item.alt > veiculoAtual.altFisica) {
        somenteLargura = false;
        break;
      }

    }

    if (somenteLargura) {
  return veiculoAtual;
}

    indiceVeiculo++;
  }

  return null;
}

function expandirItensPorQuantidade(listaCarga) {
  const itensExpandidos = [];

  listaCarga.forEach((item) => {
    for (let i = 0; i < item.qtd; i++) {
      itensExpandidos.push({
        ...item,
        qtd: 1,
      });
    }
  });

  return itensExpandidos;
}

function agruparItensPorId(itens) {
  const agrupados = [];

  itens.forEach((item) => {
    const existente = agrupados.find(
      (i) =>
        i.id === item.id &&
        i.nome === item.nome &&
        i.comp === item.comp &&
        i.larg === item.larg &&
        i.alt === item.alt &&
        i.peso === item.peso,
    );

    if (existente) {
      existente.qtd += item.qtd;
    } else {
      agrupados.push({ ...item });
    }
  });

  return agrupados;
}

function dividirItensQueExcedemMaiorVeiculo(listaCarga) {
  const maiorVeiculo = dbVeiculos[dbVeiculos.length - 1];
  const novaLista = [];

  listaCarga.forEach((item) => {
    if (testarArrumacaoFisica(maiorVeiculo, [item])) {
      novaLista.push(item);
      return;
    }

    let qtdRestante = item.qtd;

    while (qtdRestante > 0) {
      let qtdQueCabe = 0;

      for (let q = qtdRestante; q >= 1; q--) {
        const itemTeste = {
          ...item,
          qtd: q,
        };

        const pesoTeste = itemTeste.peso * itemTeste.qtd;
        const volumeTeste =
          itemTeste.comp * itemTeste.larg * itemTeste.alt * itemTeste.qtd;

        if (
          pesoTeste <= maiorVeiculo.pesoMax &&
          volumeTeste <= maiorVeiculo.volMax &&
          testarArrumacaoFisica(maiorVeiculo, [itemTeste])
        ) {
          qtdQueCabe = q;
          break;
        }
      }

      if (qtdQueCabe === 0) {
        novaLista.push({
          ...item,
          qtd: qtdRestante,
        });
        break;
      }

      novaLista.push({
        ...item,
        qtd: qtdQueCabe,
      });

      qtdRestante -= qtdQueCabe;
    }
  });

  return novaLista;
}

function planejarFrotaAntiga(listaCarga, veiculoSelecionado = null) {
  const frota = [];

  listaCarga = dividirItensQueExcedemMaiorVeiculo(listaCarga);


 // Separa a quantidade em unidades individuais para distribuir entre veículos
listaCarga = listaCarga.flatMap((item) => {
  const quantidade = Math.max(parseInt(item.qtd) || 1, 1);

  return Array.from({ length: quantidade }, (_, indice) => ({
    ...item,
    qtd: 1,
    unidade: indice + 1,
    qtdOriginal: quantidade,
  }));
});

  const veiculoPersonalizado =
    veiculoSelecionado && veiculoSelecionado.personalizado
      ? veiculoSelecionado
      : null;

  listaCarga.forEach((item) => {
    const pesoItem = item.peso * item.qtd;
    const volumeItem = item.comp * item.larg * item.alt * item.qtd;

    /*
      Primeiro verifica se existe um veículo padrão adequado
      exclusivamente para este item.
    */
    const veiculoInicialItem = escolherVeiculoIdeal(
      pesoItem,
      volumeItem,
      item.comp,
      item.larg,
      item.alt,
      [item],
    );

    let veiculoPadraoItem = encontrarVeiculoComArrumacao(
      dbVeiculos.findIndex(
        (veiculo) => veiculo.nome === veiculoInicialItem.nome,
      ),
      [item],
    );

    /*
      Impede considerar um veículo padrão que não respeite
      peso, volume ou arrumação física.
    */
    if (
  !veiculoPadraoItem ||
  pesoItem > veiculoPadraoItem.pesoMax ||
  volumeItem > veiculoPadraoItem.volMax ||
  item.comp > veiculoPadraoItem.compFisico ||
  item.larg > veiculoPadraoItem.largFisica ||
  item.alt > veiculoPadraoItem.altFisica ||
  !testarArrumacaoFisica(veiculoPadraoItem, [item])
) {
  veiculoPadraoItem = null;
}

const existeVeiculoPadraoAdequado = dbVeiculos.some((veiculo) => {
  const cabeNormal =
    item.comp <= veiculo.compFisico &&
    item.larg <= veiculo.largFisica;

  return (
    pesoItem <= veiculo.pesoMax &&
    volumeItem <= veiculo.volMax &&
    item.alt <= veiculo.altFisica &&
    cabeNormal &&
    testarArrumacaoFisica(veiculo, [item])
  );
});

if (!existeVeiculoPadraoAdequado) {
  veiculoPadraoItem = null;
}

    let viagemEncontrada = null;

    /*
      Tenta aproveitar uma viagem já criada.
    */
    for (const viagem of frota) {
      const itensTeste = [...viagem.itens, item];
      const novoPeso = viagem.pesoAtual + pesoItem;
      const novoVolume = viagem.volumeAtual + volumeItem;

      const { maiorComp, maiorLarg, maiorAlt } =
        obterMaioresDimensoes(itensTeste);

      /*
        Só coloca o item em um veículo personalizado existente
        quando nenhum veículo padrão consegue transportar o item.
      */
      if (
        viagem.veiculo.personalizado &&
        !veiculoPadraoItem &&
        novoPeso <= viagem.veiculo.pesoMax &&
        novoVolume <= viagem.veiculo.volMax &&
        testarArrumacaoFisica(viagem.veiculo, itensTeste)
      ) {
        viagemEncontrada = viagem;
        break;
      }

      /*
        Não transforma uma viagem personalizada em veículo padrão.
      */
      if (viagem.veiculo.personalizado) {
        continue;
      }

      const veiculoTeste = escolherVeiculoIdeal(
        novoPeso,
        novoVolume,
        maiorComp,
        maiorLarg,
        maiorAlt,
        itensTeste,
      );

      const veiculoAtual = encontrarVeiculoComArrumacao(
        dbVeiculos.findIndex(
          (veiculo) => veiculo.nome === veiculoTeste.nome,
        ),
        itensTeste,
      );

      if (
        veiculoAtual &&
        novoPeso <= veiculoAtual.pesoMax &&
        novoVolume <= veiculoAtual.volMax &&
        testarArrumacaoFisica(veiculoAtual, itensTeste)
      ) {
        viagem.veiculo = veiculoAtual;
        viagemEncontrada = viagem;
        break;
      }
    }

    /*
      Se não coube em nenhuma viagem existente,
      cria uma nova viagem.
    */
    if (!viagemEncontrada) {
      let veiculoFinal = null;

      if (veiculoPadraoItem) {
        // Carga comum: usa o menor veículo padrão adequado.
        veiculoFinal = veiculoPadraoItem;
      } else if (
        veiculoPersonalizado &&
        pesoItem <= veiculoPersonalizado.pesoMax &&
        volumeItem <= veiculoPersonalizado.volMax &&
        testarArrumacaoFisica(veiculoPersonalizado, [item])
      ) {
        // Carga especial: usa o veículo personalizado.
        veiculoFinal = veiculoPersonalizado;
      } else if (
  veiculoPersonalizado &&
  pesoItem <= veiculoPersonalizado.pesoMax &&
  item.comp <= veiculoPersonalizado.compFisico &&
  item.larg <= veiculoPersonalizado.largFisica
) {
  /*
    A carga cabe sobre a base do veículo personalizado.
    Altura e volume acima da referência serão tratados
    pelo alerta operacional/AET.
  */
  veiculoFinal = veiculoPersonalizado;
} else {
  /*
    Nenhum veículo atende adequadamente.
    Se o usuário selecionou um veículo personalizado,
    ele permanece como referência para mostrar a incompatibilidade.
  */
  veiculoFinal =
    veiculoPersonalizado || dbVeiculos[dbVeiculos.length - 1];
}

      viagemEncontrada = criarViagem(veiculoFinal);
      frota.push(viagemEncontrada);
    }

    viagemEncontrada.itens.push(item);
    viagemEncontrada.pesoAtual += pesoItem;
    viagemEncontrada.volumeAtual += volumeItem;

    viagemEncontrada.areaAtual = calcularAreaPisoEstimada(
      viagemEncontrada.itens,
      viagemEncontrada.veiculo,
    );

    viagemEncontrada.maiorComprimento = Math.max(
      viagemEncontrada.maiorComprimento,
      item.comp,
    );

    viagemEncontrada.maiorLargura = Math.max(
      viagemEncontrada.maiorLargura,
      item.larg,
    );

    viagemEncontrada.maiorAltura = Math.max(
      viagemEncontrada.maiorAltura,
      item.alt,
    );
  });

  return frota;
}

function planejarFrota(listaCarga, veiculoSelecionado = null) {
  const cargaAgrupada =
    dividirItensQueExcedemMaiorVeiculo(listaCarga);

  const pesoTotal = cargaAgrupada.reduce(
    (total, item) => total + item.peso * item.qtd,
    0,
  );

  const volumeTotal = cargaAgrupada.reduce(
    (total, item) =>
      total +
      item.comp *
        item.larg *
        item.alt *
        item.qtd,
    0,
  );

  const { maiorComp, maiorLarg, maiorAlt } =
    obterMaioresDimensoes(cargaAgrupada);

  const veiculoInicial = escolherVeiculoIdeal(
    pesoTotal,
    volumeTotal,
    maiorComp,
    maiorLarg,
    maiorAlt,
    cargaAgrupada,
  );

  const indiceInicial = dbVeiculos.findIndex(
    (veiculo) =>
      veiculo.nome === veiculoInicial.nome,
  );

 let veiculoParaCargaCompleta =
  encontrarVeiculoComArrumacao(
    indiceInicial,
    cargaAgrupada,
  );

/*
  C3 - BUSCA DE ALTERNATIVA POR MARGEM OPERACIONAL

  Se a carga cabe fisicamente no veículo encontrado,
  mas utiliza 95% ou mais da capacidade de peso,
  procuramos um veículo maior que:

  - comporte o peso nominalmente;
  - comporte o volume;
  - comporte fisicamente a carga;
  - mantenha o peso abaixo de 95%.

  Neste ponto ainda NÃO fracionamos a carga.
*/

if (
  veiculoParaCargaCompleta &&
  pesoTotal <= veiculoParaCargaCompleta.pesoMax &&
  !estaDentroMargemOperacionalPeso(
    pesoTotal,
    veiculoParaCargaCompleta,
  )
) {
  const indiceVeiculoAtual =
    dbVeiculos.findIndex(
      (veiculo) =>
        veiculo.nome ===
        veiculoParaCargaCompleta.nome,
    );

  let veiculoAlternativo = null;

  for (
    let i = indiceVeiculoAtual + 1;
    i < dbVeiculos.length;
    i++
  ) {
    const candidato = dbVeiculos[i];

    const pesoOk =
      pesoTotal <= candidato.pesoMax;

    const volumeOk =
      volumeTotal <= candidato.volMax;

    const margemPesoOk =
      estaDentroMargemOperacionalPeso(
        pesoTotal,
        candidato,
      );

    const arrumacaoOk =
      testarArrumacaoFisica(
        candidato,
        cargaAgrupada,
      );

    if (
      pesoOk &&
      volumeOk &&
      margemPesoOk &&
      arrumacaoOk
    ) {
      veiculoAlternativo = candidato;
      break;
    }
  }

  if (veiculoAlternativo) {
    console.log(
      "C3 - veículo alterado por margem operacional:",
      {
        veiculoOriginal:
          veiculoParaCargaCompleta.nome,

        ocupacaoOriginalPercentual:
          Number(
            (
              (pesoTotal /
                veiculoParaCargaCompleta.pesoMax) *
              100
            ).toFixed(2),
          ),

        veiculoAlternativo:
          veiculoAlternativo.nome,

        ocupacaoAlternativaPercentual:
          Number(
            (
              (pesoTotal /
                veiculoAlternativo.pesoMax) *
              100
            ).toFixed(2),
          ),
      },
    );

    veiculoParaCargaCompleta =
      veiculoAlternativo;
  }
}

  const cargaCompletaCabe =
    veiculoParaCargaCompleta &&
    pesoTotal <= veiculoParaCargaCompleta.pesoMax &&
    volumeTotal <= veiculoParaCargaCompleta.volMax &&
    testarArrumacaoFisica(
      veiculoParaCargaCompleta,
      cargaAgrupada,
    );

  if (cargaCompletaCabe) {
    const viagem = criarViagem(
      veiculoParaCargaCompleta,
    );

    viagem.itens = cargaAgrupada;
    viagem.pesoAtual = pesoTotal;
    viagem.volumeAtual = volumeTotal;

    viagem.areaAtual = calcularAreaPisoEstimada(
      cargaAgrupada,
      veiculoParaCargaCompleta,
    );

    viagem.maiorComprimento = maiorComp;
    viagem.maiorLargura = maiorLarg;
    viagem.maiorAltura = maiorAlt;

    return [viagem];
  }

  return planejarFrotaAntiga(
    listaCarga,
    veiculoSelecionado,
  );
}

function distribuirCargaEmVeiculos(listaCarga) {
  let pendentes = [...listaCarga];

  pendentes.sort((a, b) => {
    const areaA = a.comp * a.larg;
    const areaB = b.comp * b.larg;

    if (areaB !== areaA) return areaB - areaA;
    if (b.peso !== a.peso) return b.peso - a.peso;

    return b.alt - a.alt;
  });

  const resultado = [];

  while (pendentes.length > 0) {
    const primeiro = pendentes[0];

    const pesoPrimeiro = primeiro.peso * primeiro.qtd;

    const volumePrimeiro =
      primeiro.comp * primeiro.larg * primeiro.alt * primeiro.qtd;

    const veiculo = escolherVeiculoIdeal(
  pesoPrimeiro,
  volumePrimeiro,
  primeiro.comp,
  primeiro.larg,
  primeiro.alt,
  [primeiro],
);

    let pesoAtual = 0;
    let volumeAtual = 0;
    let areaAtual = 0;

    const carga = [];
    const restantes = [];

    pendentes.forEach((item) => {
      const pesoItem = item.peso * item.qtd;

      const volumeItem = item.comp * item.larg * item.alt * item.qtd;
      const areaItem = item.comp * item.larg * item.qtd;

      const cabePeso = pesoAtual + pesoItem <= veiculo.pesoMax;

      const cabeVolume = volumeAtual + volumeItem <= veiculo.volMax;

      const cabeComprimento = item.comp <= veiculo.compFisico;

      const cabeLargura = item.larg <= veiculo.largFisica;

      const cabeAltura = item.alt <= veiculo.altFisica;

      const areaMaxVeiculo = veiculo.compFisico * veiculo.largFisica;

      const cabeArea = areaAtual + areaItem <= areaMaxVeiculo;

      if (
        cabePeso &&
        cabeVolume &&
        cabeArea &&
        cabeComprimento &&
        cabeLargura &&
        cabeAltura
      ) {
        carga.push(item);

        pesoAtual += pesoItem;
        volumeAtual += volumeItem;
        areaAtual += areaItem;
      } else {
        restantes.push(item);
      }
    });

    resultado.push({
      veiculo: veiculo,

      itens: carga,
    });

    pendentes = restantes;
  }

  return resultado;
}

// =====================================================
// CÁLCULO PRINCIPAL DA CARGA
// =====================================================

function verificarAlertaAET(cargas) {
  const alertas = [];

  let encontrouLargura = false;
  let encontrouAltura = false;
  let encontrouComprimento = false;
  let encontrouPeso = false;

  cargas.forEach((viagem, indice) => {
    const veiculo = viagem.veiculo;

    let largura = false;
    let altura = false;
    let comprimento = false;
    let peso = false;

    const pesoTotal = viagem.pesoAtual;

    if (pesoTotal > 57000) {
      peso = true;
      encontrouPeso = true;
    }

    viagem.itens.forEach((item) => {
      if (item.larg > 2.6) {
        largura = true;
        encontrouLargura = true;
      }

      if (item.alt > 4.4) {
        altura = true;
        encontrouAltura = true;
      }

      if (item.comp > 30) {
        comprimento = true;
        encontrouComprimento = true;
      }
    });

    if (largura) {
      alertas.push(
        `Veículo ${indice + 1} — ${veiculo.nome}: Largura ${viagem.maiorLargura.toFixed(2)} m — excede o limite de 2,60 m`
      );
    }

    if (altura) {
      alertas.push(
        `Veículo ${indice + 1} — ${veiculo.nome}: Altura ${viagem.maiorAltura.toFixed(2)} m — excede o limite de 4,40 m`
      );
    }

    if (comprimento) {
      alertas.push(
        `Veículo ${indice + 1} — ${veiculo.nome}: Comprimento ${viagem.maiorComprimento.toFixed(2)} m — excede o limite de 30,00 m`
      );
    }

    if (peso) {
      alertas.push(
        `Veículo ${indice + 1} — ${veiculo.nome}: Peso ${pesoTotal.toLocaleString(
          "pt-BR"
        )} kg — excede o limite de 57.000 kg`
      );
    }
  });

  if (alertas.length === 0) {
    return null;
  }

  let conceitoGuia = "aet";
let veiculoGuia = "";

const somentePeso =
  encontrouPeso &&
  !encontrouLargura &&
  !encontrouAltura &&
  !encontrouComprimento;

const somenteAltura =
  encontrouAltura &&
  !encontrouLargura &&
  !encontrouComprimento &&
  !encontrouPeso;

  const somenteComprimento =
  encontrouComprimento &&
  !encontrouAltura &&
  !encontrouLargura &&
  !encontrouPeso;

if (somentePeso) {
  conceitoGuia = "pbtc";
}

if (somenteAltura) {
  conceitoGuia = "";
  veiculoGuia = "prancha-rebaixada";
}

if (somenteComprimento) {
  conceitoGuia = "";
  veiculoGuia = "prancha-extensivel";
}

  return {
    titulo: "ALERTA OPERACIONAL — POSSÍVEL NECESSIDADE DE AET",

    conceitoGuia,
    veiculoGuia,

    mensagem: `
      Durante o planejamento da carga foram identificados parâmetros que podem exigir procedimentos operacionais específicos, conforme a configuração final do conjunto e a legislação vigente.
      <br><br>

      ${alertas.join("<br>")}

      <br><br>

      <strong>ANTES DE INICIAR A OPERAÇÃO, VERIFIQUE:</strong><br>
      • Confirmar a necessidade de AET;<br>
      • Conferir PBTC e capacidade do conjunto;<br>
      • Verificar a distribuição de peso por eixo;<br>
      • Calcular a altura total do conjunto carregado;<br>
      • Confirmar largura e comprimento finais da operação;<br>
      • Verificar restrições de rota e horário;<br>
      • Avaliar necessidade de escolta;<br>
      • Conferir berços, calços, apoios e sistemas de fixação.

      <br><br>

      <strong>ATENÇÃO:</strong>
      A confirmação definitiva depende da configuração completa do conjunto,
      da rota e das exigências do órgão responsável pela via.
    `,
  };
}

function calcularCarga() {
  ressalvaCgAtual = null;
  orientacaoLongitudinalCgAtual = null;

  const lines = document.querySelectorAll("#tabela-carga tbody tr");

  // Esconde resultados se não houver linhas
  if (lines.length === 0) {
    document.getElementById("bloco-resultados").style.display = "none";
    document.getElementById("bloco-mapa").style.display = "none";
    document.getElementById("alerta-frota").style.display = "none";
    document.getElementById("sugestao-frota").style.display = "none";
    document.getElementById("selo-compatibilidade").style.display = "none";
    document.getElementById("btn-gerar-pdf").style.display = "none";
    document.getElementById("btn-excel").style.display = "none";
    return;
  }

  if (verificarItensIncompletos()) {
  document.getElementById("bloco-resultados").style.display = "none";
  document.getElementById("bloco-mapa").style.display = "none";
  document.getElementById("alerta-frota").style.display = "none";
  document.getElementById("sugestao-frota").style.display = "none";
  document.getElementById("selo-compatibilidade").style.display = "none";
  document.getElementById("btn-gerar-pdf").style.display = "none";
  document.getElementById("btn-excel").style.display = "none";
  return;
}

  let volTotal = 0,
    pesoTotal = 0;
  let itemEstouraDimensao = false;
  let listaCarga = [];
  let maiorCompItem = 0,
    maiorLargItem = 0,
    maiorAltItem = 0;

  const valorSelectVeiculo = document.getElementById("select-veiculo").value;
  let indexSel = parseInt(valorSelectVeiculo);
  let vSelecionado;

  if (valorSelectVeiculo === "personalizado") {
    const nomePersonalizado = document.getElementById("vp-nome").value.trim();
    const pesoPersonalizado = parseFloat(
      document.getElementById("vp-peso").value,
    );
    const compPersonalizado =
      parseFloat(document.getElementById("vp-comp").value) / 100;
    const largPersonalizado =
      parseFloat(document.getElementById("vp-larg").value) / 100;
    const altPersonalizado =
      parseFloat(document.getElementById("vp-alt").value) / 100;
      const qtdConjuntosPersonalizados = Math.max(
      parseInt(document.getElementById("vp-qtd").value) || 1,
  1,
);

    if (
      !nomePersonalizado ||
      !pesoPersonalizado ||
      !compPersonalizado ||
      !largPersonalizado ||
      !altPersonalizado
    ) {
      alert("Preencha todos os dados do veículo personalizado.");
      return;
    }

    vSelecionado = {
      nome: nomePersonalizado,
      pesoMax: pesoPersonalizado,
      compFisico: compPersonalizado,
      largFisica: largPersonalizado,
      altFisica: altPersonalizado,
      volMax: compPersonalizado * largPersonalizado * altPersonalizado,
      personalizado: true,
      qtdConjuntos: qtdConjuntosPersonalizados,
    };

      console.log("Qtd. Conjuntos:", vSelecionado.qtdConjuntos);

    indexSel = -1;
  } else {
    vSelecionado = dbVeiculos[indexSel];
  }

  // DEBUG: Cole isso logo após o vSelecionado ser definido
  console.log("Veículo Selecionado:", vSelecionado);
  console.log("Comprimento Físico:", vSelecionado.compFisico);
  console.log("Largura Física:", vSelecionado.largFisica);
  console.log("Altura Física:", vSelecionado.altFisica);

  lines.forEach((linha, index) => {
    try {
      const nome = linha.querySelector(".nome").value || `Item ${index + 1}`;
      const qtd = parseInt(linha.querySelector(".qtd").value) || 0;

      const comp =
        Math.max(
          parseFloat(linha.querySelector(".comp").value.replace(",", ".")) || 0,
          0,
        ) / 100;
      const larg =
        Math.max(
          parseFloat(linha.querySelector(".larg").value.replace(",", ".")) || 0,
          0,
        ) / 100;
      const alt =
        Math.max(
          parseFloat(linha.querySelector(".alt").value.replace(",", ".")) || 0,
          0,
        ) / 100;

      let pesoInput = linha.querySelector(".peso").value.trim();
      const peso = Math.max(
        Number(pesoInput.replace(/\./g, "").replace(",", ".")) || 0,
        0,
      );

      if (qtd > 0 && comp > 0 && larg > 0 && alt > 0) {
        volTotal += comp * larg * alt * qtd;
        pesoTotal += peso * qtd;

        if (comp > maiorCompItem) maiorCompItem = comp;
        if (larg > maiorLargItem) maiorLargItem = larg;
        if (alt > maiorAltItem) maiorAltItem = alt;

        // Substitua por este:
        if (
          comp > vSelecionado.compFisico ||
          larg > vSelecionado.largFisica ||
          alt > vSelecionado.altFisica
        ) {
          itemEstouraDimensao = true;
        }
      }

      listaCarga.push({
        id: index + 1,
        nome: nome,
        qtd: qtd,
        comp: comp,
        larg: larg,
        alt: alt,
        peso: peso,
        cor: coresItens[index % coresItens.length],
      });
    } catch (e) {
      console.error("Erro na linha " + index, e);
    }
  });

  let veiculoCalculado = null;
let volMaxCalculado = 0;
let cargas = [];

  // --- LÓGICA DE EXIBIÇÃO E ALERTAS ---

  if (listaCarga.length > 0) {
    document.getElementById("bloco-mapa").style.display = "block";

    const container = document.getElementById("container-veiculos");
    container.innerHTML = "";

     cargas = planejarFrota(listaCarga, vSelecionado);
    ultimaFrotaCalculada = cargas;

    veiculoCalculado = cargas.reduce((maior, carga) => {
      const indiceMaior = dbVeiculos.findIndex((v) => v.nome === maior.nome);

      const indiceAtual = dbVeiculos.findIndex(
        (v) => v.nome === carga.veiculo.nome,
      );

      return indiceAtual > indiceMaior ? carga.veiculo : maior;
    }, cargas[0].veiculo);

    volMaxCalculado =
      veiculoCalculado.compFisico *
      veiculoCalculado.largFisica *
      veiculoCalculado.altFisica;

    const indiceVeiculoCalculado = dbVeiculos.findIndex(
      (v) => v.nome === veiculoCalculado.nome,
    );

    if (
  !vSelecionado.personalizado &&
  indiceVeiculoCalculado !== indexSel &&
  indiceVeiculoCalculado !== -1 &&
  !trocaAutomaticaVeiculo
) {
      avisoTrocaVeiculo = {
        original: vSelecionado.nome,
        calculado: veiculoCalculado.nome,
      };

      trocaAutomaticaVeiculo = true;

      document.getElementById("select-veiculo").value = indiceVeiculoCalculado;

      verificarVeiculoPersonalizado();

      calcularCarga();

      return;
    }

    trocaAutomaticaVeiculo = false;
    alertaOperacionalAET = verificarAlertaAET(cargas);

    cargas.forEach((carga, indice) => {
      const numero = indice + 1;

      criarMapaVeiculo(numero);

      const pesoVeiculo = carga.pesoAtual || 0;
      const volumeVeiculo = carga.volumeAtual || 0;

      const areaBrutaVeiculo = carga.areaAtual || 0;

      const areaMaxVeiculo =
        carga.veiculo.compFisico * carga.veiculo.largFisica;

      const areaVeiculo = Math.min(areaBrutaVeiculo, areaMaxVeiculo);

      const volMaxVeiculo =
        carga.veiculo.compFisico *
        carga.veiculo.largFisica *
        carga.veiculo.altFisica;

      const pctPesoVeiculo = Math.min(
        (pesoVeiculo / carga.veiculo.pesoMax) * 100,
        100,
      );

      const pctVolVeiculo = Math.min(
        (volumeVeiculo / volMaxVeiculo) * 100,
        100,
      );

      document.getElementById(`titulo-veiculo-${numero}`).innerHTML = `
<div class="card-veiculo">

    <div class="card-veiculo-titulo">

        <span class="card-veiculo-icone">🚚</span>
        <span>${carga.veiculo.nome}</span>
    </div>

   <div class="card-veiculo-grid">

        <div class="card-veiculo-label">⚖️ Peso</div>
        <div>
            <strong class="card-veiculo-valor">${formatarBR(pesoVeiculo)}</strong>
            <span class="card-veiculo-complemento">/ ${formatarBR(carga.veiculo.pesoMax)} kg</span>
        </div>

        <div class="card-veiculo-label">📦 Volume</div>
        <div>
            <strong class="card-veiculo-valor">${formatarBR(volumeVeiculo)}</strong>
            <span class="card-veiculo-complemento">/ ${formatarBR(volMaxVeiculo)} m³</span>
        </div>

        <div class="card-veiculo-label">📐 Área útil</div>
        <div>
            <strong class="card-veiculo-valor">${formatarBR(areaVeiculo)}</strong>
            <span class="card-veiculo-complemento">/ ${formatarBR(areaMaxVeiculo)} m²</span>
        </div>

    </div>

</div>
`;

      document.getElementById(`peso-veiculo-${numero}`).innerText =
        formatarBR(pesoVeiculo);

      document.getElementById(`peso-max-veiculo-${numero}`).innerText =
        formatarBR(carga.veiculo.pesoMax);

      document.getElementById(`vol-veiculo-${numero}`).innerText =
        formatarBR(volumeVeiculo);

      document.getElementById(`vol-max-veiculo-${numero}`).innerText =
        formatarBR(volMaxVeiculo);

      const barPesoVeiculo = document.getElementById(
        `bar-peso-veiculo-${numero}`,
      );

      barPesoVeiculo.style.width = pctPesoVeiculo.toFixed(0) + "%";

      barPesoVeiculo.innerText = pctPesoVeiculo.toFixed(0) + "%";
      barPesoVeiculo.classList.remove(
        "fill-verde",
        "fill-amarelo",
        "fill-vermelho",
        "fill-piscando",
      );

      if (pctPesoVeiculo >= 100) {
        barPesoVeiculo.classList.add("fill-vermelho");
      } else if (pctPesoVeiculo >= 80) {
        barPesoVeiculo.classList.add("fill-amarelo");
      } else {
        barPesoVeiculo.classList.add("fill-verde");
      }

      const barVolVeiculo = document.getElementById(
        `bar-vol-veiculo-${numero}`,
      );

      barVolVeiculo.style.width = pctVolVeiculo.toFixed(0) + "%";

      barVolVeiculo.innerText = pctVolVeiculo.toFixed(0) + "%";
      barVolVeiculo.classList.remove(
        "fill-verde",
        "fill-amarelo",
        "fill-vermelho",
        "fill-piscando",
      );

      if (pctVolVeiculo >= 100) {
        barVolVeiculo.classList.add("fill-vermelho");
      } else if (pctVolVeiculo >= 80) {
        barVolVeiculo.classList.add("fill-amarelo");
      } else {
        barVolVeiculo.classList.add("fill-verde");
      }

      // =====================================================
// REAGRUPAR ITENS IGUAIS PARA O SVG E EMPILHAMENTO
// =====================================================

const itensAgrupadosParaSVG = Object.values(
  carga.itens.reduce((agrupados, item) => {
    const chave = [
      item.id,
      item.nome,
      item.comp,
      item.larg,
      item.alt,
      item.peso,
      item.cor,
    ].join("|");

    if (!agrupados[chave]) {
      agrupados[chave] = {
        ...item,
        qtd: 0,
      };
    }

    agrupados[chave].qtd += Number(item.qtd) || 1;

    return agrupados;
  }, {})
);

renderizarArrumacaoLogica(
  carga.veiculo,
  carga.itens,
  `svg-${numero}`,
  `legenda-${numero}`,
  `dimesoes-${numero}`,
);
    });
  } else {
    document.getElementById("bloco-mapa").style.display = "none";
    globalEstorouMetragem = false;
  }
  
  const divAlerta = document.getElementById("alerta-frota");
  const divSugestao = document.getElementById("sugestao-frota");
  const selo = document.getElementById("selo-compatibilidade");
  const btnPdf = document.getElementById("btn-gerar-pdf");
  const btnExcel = document.getElementById("btn-excel");

if (listaCarga.length === 0) {
  selo.style.display = "none";
  btnPdf.style.display = "none";
  btnExcel.style.display = "none";
  divAlerta.style.display = "none";
  divSugestao.style.display = "none";

} else if (globalEstorouMetragem) {
  selo.style.display = "block";
  selo.className = "selo-compatibilidade selo-nao-compativel";
  selo.innerHTML = `
    <i class="fa-solid fa-circle-xmark"></i>
    <span>OPERAÇÃO NÃO COMPATÍVEL</span>
  `;

  btnPdf.style.display = "none";
  btnExcel.style.display = "none";

  divAlerta.style.display = "block";
  divAlerta.innerHTML = `
    ⚠️ <strong>ALERTA DE ARRUMAÇÃO:</strong><br>
    A carga foi distribuída na frota calculada, porém algum item excedeu a disposição física no mapa.
    Revise a arrumação ou considere fracionar a carga.
  `;

  divSugestao.style.display = "none";

} else {
  divAlerta.style.display = "none";

  if (avisoTrocaVeiculo) {
    divSugestao.style.display = "block";

    divSugestao.innerHTML = `
      🔄 <strong>VEÍCULO AJUSTADO AUTOMATICAMENTE</strong><br>
      O veículo inicialmente selecionado foi
      <strong>${avisoTrocaVeiculo.original}</strong>.<br>
      Após analisar as dimensões, o peso e a margem operacional de segurança da carga, o sistema identificou que
      <strong>${avisoTrocaVeiculo.calculado}</strong>
      é a opção mais adequada para realizar esta operação.
    `;

    avisoTrocaVeiculo = null;
  } else {
    divSugestao.style.display = "none";
  }

const cargaAprovada =
  !globalEstorouMetragem &&
  !itemEstouraDimensao &&
  cargas.every(
    (viagem) => viagem.pesoAtual <= viagem.veiculo.pesoMax
  );

/*
  C3 - VERIFICAÇÃO DE LIMITE OPERACIONAL DA FROTA

  Identifica viagens que ainda estão dentro da
  capacidade máxima cadastrada, mas utilizam
  95% ou mais da capacidade de peso.
*/

const cargaEmLimiteOperacional =
  cargaAprovada &&
  cargas.some((viagem) => {
    const percentualPeso =
      viagem.pesoAtual / viagem.veiculo.pesoMax;

    return (
      percentualPeso >= LIMITE_PESO_ATENCAO &&
      percentualPeso <= 1
    );
  });

if (cargaAprovada && alertaOperacionalAET) {
  // A carga cabe, mas exige atenção regulatória.
  selo.style.display = "block";
  selo.className = "selo-compatibilidade selo-atencao";
  selo.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span>ATENÇÃO REGULATÓRIA
Verifique a necessidade de AET</span>
  `;

  // Continua permitindo os relatórios.
  btnPdf.style.display = "block";
  btnExcel.style.display = "block";

} else if (
  cargaAprovada &&
  cargaEmLimiteOperacional
) {
  /*
    A carga ainda está dentro da capacidade máxima,
    mas atingiu a faixa operacional de 95% ou mais.
  */

  selo.style.display = "block";
  selo.className =
    "selo-compatibilidade selo-atencao";

  selo.innerHTML = `
  <i class="fa-solid fa-triangle-exclamation"></i>
  <span>
    LIMITE OPERACIONAL -
    Avalie outro veículo ou o fracionamento da carga.
    <a
  href="src/veiculos-especiais-busca-inteligente.html"
  class="link-guia-limite"
  target="_blank"
  rel="noopener noreferrer"
>
      Consulte o Guia Operacional
    </a>
  </span>
`;

  /*
    Como não estamos tratando 95% como
    incompatibilidade física ou legal,
    os relatórios continuam disponíveis.
  */

  btnPdf.style.display = "block";
  btnExcel.style.display = "block";

  divSugestao.style.display = "block";

  divSugestao.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <strong>MARGEM OPERACIONAL DE PESO ATINGIDA</strong><br>

    A carga permanece dentro da capacidade máxima
    cadastrada do veículo, porém utiliza
    95% ou mais da capacidade de peso.<br>

    Como não foi encontrada uma alternativa superior
    disponível na frota cadastrada, recomenda-se
    avaliar o fracionamento da carga ou outra
    configuração operacional.
  `;

} else if (cargaAprovada) {
  selo.style.display = "block";

  if (ressalvaCgAtual) {
  selo.className =
    "selo-compatibilidade selo-atencao";

  const complementoC4 =
    orientacaoLongitudinalCgAtual
      ? `
        <br>
        <span class="c4-orientacao-inline">
          <strong>Tendência longitudinal:</strong>
          ${orientacaoLongitudinalCgAtual.regiao === "traseira"
            ? "concentração predominante na região traseira."
            : "concentração predominante na região dianteira."}
        </span>
      `
      : "";

  selo.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span>
      <strong>${ressalvaCgAtual.titulo}</strong><br>
      ${ressalvaCgAtual.mensagem}

      ${complementoC4}

      <br>
      <a
        href="src/veiculos-especiais-busca-inteligente.html"
        class="link-guia-limite"
        target="_blank"
        rel="noopener noreferrer"
      >
        Consulte o Guia Operacional
      </a>
    </span>
  `;
} else if (mensagemTransversalCgAtual) {

  selo.className =
  "selo-compatibilidade selo-atencao";

  selo.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span>
      <strong>${mensagemTransversalCgAtual.titulo}</strong><br>
      ${mensagemTransversalCgAtual.mensagem}

      <br>
      <small>
        Classificação interna do DCPRO para triagem matemática.
        Não representa limite legal ou avaliação real de estabilidade do veículo.
      </small>

      <br>
      <a
        href="src/veiculos-especiais-busca-inteligente.html"
        class="link-guia-limite"
        target="_blank"
        rel="noopener noreferrer"
      >
        Consulte o Guia Operacional
      </a>
    </span>
  `;

} else {
  selo.className =
    "selo-compatibilidade selo-cabe";

  selo.innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    <span>CARGA APROVADA</span>
  `;
}

  btnPdf.style.display = "block";
  btnExcel.style.display = "block";

} else {
  selo.style.display = "block";
  selo.className = "selo-compatibilidade selo-nao-compativel";
  selo.innerHTML = `
    <i class="fa-solid fa-circle-xmark"></i>
    <span>OPERAÇÃO NÃO COMPATÍVEL</span>
  `;

  btnPdf.style.display = "none";
  btnExcel.style.display = "none";
}

}

  const divAlertaAET = document.getElementById("alerta-aet");

if (divAlertaAET) {
  if (alertaOperacionalAET) {
    divAlertaAET.style.display = "block";

    divAlertaAET.innerHTML = `
      <div class="alerta-guia">
        <div class="alerta-guia-texto">
          <i class="fa-solid fa-circle-info"></i>

          <div>
            <strong>IMPORTANTE:</strong>
            Antes de planejar um transporte especial, consulte o
            <strong>Guia Operacional DCPRO</strong> para conhecer veículos,
            aplicações e conceitos operacionais.
          </div>
        </div>

        <a href="src/veiculos-especiais-busca-inteligente.html?${
  alertaOperacionalAET.veiculoGuia
    ? `veiculo=${alertaOperacionalAET.veiculoGuia}`
    : `conceito=${alertaOperacionalAET.conceitoGuia}`
}"
   class="btn-consultar-guia-alerta">
          <i class="fa-solid fa-book-open"></i>
          Consultar Guia
        </a>
      </div>

      <strong>${alertaOperacionalAET.titulo}</strong><br>
      ${alertaOperacionalAET.mensagem}
    `;

  } else {
    divAlertaAET.style.display = "none";
  }
}

  // --- ATUALIZAÇÃO FINAL DAS BARRAS ---
  document.getElementById("txt-peso").innerText = formatarBR(pesoTotal);
  document.getElementById("max-peso").innerText = formatarBR(
    veiculoCalculado.pesoMax,
  );

  let pctPeso = Math.min((pesoTotal / veiculoCalculado.pesoMax) * 100, 100);
  document.getElementById("bar-peso").style.width = pctPeso.toFixed(0) + "%";
  document.getElementById("bar-peso").innerText = pctPeso.toFixed(0) + "%";

  const barPeso = document.getElementById("bar-peso");
  barPeso.classList.remove(
    "fill-verde",
    "fill-amarelo",
    "fill-vermelho",
    "fill-piscando",
  );

  if (pesoTotal > veiculoCalculado.pesoMax) {
    barPeso.classList.add("fill-piscando");
  } else if (pctPeso >= 95) {
    barPeso.classList.add("fill-vermelho");
  } else if (pctPeso >= 80) {
    barPeso.classList.add("fill-amarelo");
  } else {
    barPeso.classList.add("fill-verde");
  }

  document.getElementById("txt-vol").innerText = formatarBR(volTotal);
  document.getElementById("max-vol").innerText = formatarBR(volMaxCalculado);

  let pctVol = Math.min((volTotal / volMaxCalculado) * 100, 100);
  const barVol = document.getElementById("bar-vol");
  barVol.style.width = pctVol.toFixed(0) + "%";
  barVol.innerText = pctVol.toFixed(0) + "%";

  barVol.classList.remove(
    "fill-verde",
    "fill-amarelo",
    "fill-vermelho",
    "fill-piscando",
  );

  if (volTotal > volMaxCalculado || globalEstorouMetragem) {
    barVol.classList.add("fill-piscando");
  } else if (pctVol > 100) {
    barVol.classList.add("fill-vermelho");
  } else if (pctVol >= 95) {
    barVol.classList.add("fill-verde");
  } else if (pctVol >= 80) {
    barVol.classList.add("fill-amarelo");
  } else {
    barVol.classList.add("fill-verde");
  }

  document.getElementById("bloco-resultados").style.display = "none";
}

// =====================================================
// RENDERIZAÇÃO DOS MAPAS E SVG
// =====================================================

function criarMapaVeiculo(numero) {
  const container = document.getElementById("container-veiculos");

  const bloco = document.createElement("div");

  bloco.className = "bloco-veiculo";

  bloco.innerHTML = `
    <h3 id="titulo-veiculo-${numero}" class="titulo-veiculo">
    🚚 Veículo ${numero}
</h3>

    <div id="resumo-veiculo-${numero}" class="resultados resumo-veiculo">
        <strong>Resumo de Ocupação</strong>

        <div class="metric-container">
            <label>
                <strong>Peso:</strong>
                <span id="peso-veiculo-${numero}">0</span> kg de
                <span id="peso-max-veiculo-${numero}">0</span> kg
            </label>
            <div class="bar-bg">
                <div id="bar-peso-veiculo-${numero}" class="bar-fill fill-peso">0%</div>
            </div>
        </div>

        <div class="metric-container">
            <label>
                <strong>Volume:</strong>
                <span id="vol-veiculo-${numero}">0</span> m³ de
                <span id="vol-max-veiculo-${numero}">0</span> m³
            </label>
            <div class="bar-bg">
                <div id="bar-vol-veiculo-${numero}" class="bar-fill">0%</div>
            </div>
        </div>
    </div>

    <div id="dimesoes-${numero}" class="dimensoes-bau-tag">
        Dimensões Internas Disponíveis: -
    </div>

    <div class="canvas-container">
            <svg id="svg-${numero}"
                 width="750"
                 height="220"
                 class="svg-mapa-carga">
            </svg>
        </div>

        <div class="legenda" id="legenda-${numero}"></div>

    `;

  container.appendChild(bloco);
}

function posicionarCaixaComAET(caixa, veiculo) {
  const excessoLateral =
    caixa.comp <= veiculo.compFisico + 0.01 &&
    caixa.larg > veiculo.largFisica &&
    alertaOperacionalAET;

  if (!excessoLateral) {
    return false;
  }

  caixa.X_Fisico = 0;
  caixa.Y_Fisico = 0;
  caixa.compRender = caixa.comp;
  caixa.largRender = veiculo.largFisica;
  caixa.excessoAET = true;

  return true;
}

/*
  C3 - MARGEM OPERACIONAL DE PESO

  Limites internos usados pelo DCPRO para diferenciar
  capacidade máxima cadastrada de margem operacional
  recomendada.

  IMPORTANTE:
  Estes percentuais são critérios de planejamento
  do DCPRO e não representam, isoladamente,
  limites legais de transporte.
*/

const LIMITE_PESO_NORMAL = 0.90;
const LIMITE_PESO_ATENCAO = 0.95;

function renderizarArrumacaoLogica(
  veiculo,
  itens,
  svgID,
  legendaID,
  dimensaoID,
) {
  const svgCima = document.getElementById(svgID);

  const legendaContainer = document.getElementById(legendaID);

  const txtDimensoes = document.getElementById(dimensaoID);

  svgCima.innerHTML = "";
  legendaContainer.innerHTML = "";
  globalEstorouMetragem = false;
  globalItensExcedentes = [];

  const larguraMaximaCanvasGeral = 900;
  const alturaCanvasGeral = 280;
  const margemBorda = 14;

  const comprimentoReferenciaVisual = 13.5;
  const larguraReferenciaVisual = 2.45;

  const escalaGlobalX =
    (larguraMaximaCanvasGeral - margemBorda * 2) / comprimentoReferenciaVisual;

  const escalaGlobalY =
    (alturaCanvasGeral - margemBorda * 2) / larguraReferenciaVisual;

  let larguraBauPixels = veiculo.compFisico * escalaGlobalX;
  let alturaBauPixels = veiculo.largFisica * escalaGlobalY;

  let caixasIndividuais = [];

// =====================================================
// LEGENDA AGRUPADA POR ITEM
// =====================================================

const itensLegenda = Object.values(
  itens.reduce((agrupados, item) => {
    const chave =
      `${item.id}|${item.nome}|${item.comp}|${item.larg}|${item.alt}`;

    if (!agrupados[chave]) {
      agrupados[chave] = {
        ...item,
        qtd: 0,
      };
    }

    agrupados[chave].qtd += Number(item.qtd) || 0;

    return agrupados;
  }, {})
);

itensLegenda.forEach((item) => {
  legendaContainer.innerHTML += `
    <div class="legenda-item">
        <div
          class="legenda-cor"
          style="background-color: ${item.cor};"
        ></div>

        <span>
            <strong>Item ${item.id}</strong>
            &nbsp;
            <b>${item.nome}</b>
            &nbsp;
            ${item.qtd}x
            &nbsp;•&nbsp;
            ${item.comp.toFixed(2)}m ×
            ${item.larg.toFixed(2)}m
        </span>
    </div>
  `;
});

// =====================================================
// PILHAS FÍSICAS COMPOSTAS
//
// Itens cadastrados em linhas diferentes podem compartilhar
// a mesma pilha quando possuem a mesma base física.
//
// A identidade individual de cada volume é preservada.
// Base e palete continuam sem empilhamento automático.
// =====================================================

const gruposEmpilhamento =
  agruparItensParaEmpilhamento(itens);

gruposEmpilhamento.forEach((grupo) => {

  // ===================================================
  // BASE / PALETE
  // Permanecem como posições individuais.
  // ===================================================

  if (grupo.ehPalletOuBase) {

    grupo.unidades.forEach((unidade) => {

      const nomeMinusculo =
        String(unidade.nome || "").toLowerCase();

      let textoInterno = "";

      if (
        nomeMinusculo.includes("pallet") ||
        nomeMinusculo.includes("palete")
      ) {
        textoInterno = "PALETE";
      }

      if (nomeMinusculo.includes("base")) {
        textoInterno = "BASE";
      }

      caixasIndividuais.push({
        id: unidade.id,
        nome: unidade.nome,

        comp: grupo.comp,
        larg: grupo.larg,

        cor: unidade.cor,

        ehPallet: true,
        textoTxt: textoInterno,

        empilhados: 1,

        pesoUnitario: unidade.peso,
        pesoBloco: unidade.peso,

        alturaTotal: unidade.alt,

        unidades: [
          {
            ...unidade,
          },
        ],

        dimTexto:
          `${grupo.comp.toFixed(2)}x${grupo.larg.toFixed(2)}`,

        area:
          grupo.comp * grupo.larg,
      });
    });

    return;
  }

  // ===================================================
  // CAIXAS / VOLUMES EMPILHÁVEIS
  // ===================================================

  const unidades =
    [...grupo.unidades].sort(
      (a, b) =>
        b.alt - a.alt ||
        b.peso - a.peso
    );

  const pilhas = [];

  unidades.forEach((unidade) => {

    let pilhaEncontrada = null;

    for (const pilha of pilhas) {

      const possuiItemAlto =
        unidade.alt > 0.8 ||
        pilha.unidades.some(
          (u) => u.alt > 0.8
        );

      const limiteQuantidade =
        possuiItemAlto ? 2 : 3;

      const novaAltura =
        pilha.alturaTotal +
        unidade.alt;

      const cabePorQuantidade =
        pilha.unidades.length <
        limiteQuantidade;

      const cabePorAltura =
        novaAltura <=
        veiculo.altFisica + 0.01;

      if (
        cabePorQuantidade &&
        cabePorAltura
      ) {
        pilhaEncontrada = pilha;
        break;
      }
    }

    if (pilhaEncontrada) {

      pilhaEncontrada.unidades.push(
        unidade
      );

      pilhaEncontrada.alturaTotal +=
        unidade.alt;

    } else {

      pilhas.push({
        alturaTotal: unidade.alt,
        unidades: [unidade],
      });
    }
  });

  // ===================================================
  // CONVERTE CADA PILHA EM UM BLOCO DE PISO
  // ===================================================

  pilhas.forEach((pilha) => {

    // Depois que a composição física foi definida,
    // organizamos a pilha pelo peso:
    // mais pesado primeiro = parte inferior.
    pilha.unidades.sort(
      (a, b) => b.peso - a.peso
    );

    const pesoBloco =
      pilha.unidades.reduce(
        (total, unidade) =>
          total + unidade.peso,
        0
      );

    const unidadeReferencia =
      pilha.unidades[0];

    const nomesPilha =
      pilha.unidades
        .map((unidade) => unidade.nome)
        .join(" + ");

    caixasIndividuais.push({
      id: unidadeReferencia.id,

      nome:
        pilha.unidades.length > 1
          ? nomesPilha
          : unidadeReferencia.nome,

      comp: grupo.comp,
      larg: grupo.larg,

      cor: unidadeReferencia.cor,

      ehPallet: false,
      textoTxt: "",

      empilhados:
        pilha.unidades.length,

      pesoUnitario:
        unidadeReferencia.peso,

      pesoBloco,

      alturaTotal:
        pilha.alturaTotal,

      unidades:
        pilha.unidades.map(
          (unidade) => ({
            ...unidade,
          })
        ),

      dimTexto:
        `${grupo.comp.toFixed(2)}x${grupo.larg.toFixed(2)}`,

      area:
        grupo.comp * grupo.larg,
    });
  });
});
  caixasIndividuais.sort((a, b) => {
  const pesoA = (a.peso || 0) * (a.quantidadeEmpilhada || 1);
  const pesoB = (b.peso || 0) * (b.quantidadeEmpilhada || 1);

  return (
    pesoB - pesoA ||
    b.comp - a.comp ||
    b.area - a.area
  );
});

// =====================================================
// C3 - CLASSIFICAÇÃO DE PESO E REGIÃO ESTIMADA DOS EIXOS
// =====================================================

// Um bloco será considerado pesado quando tiver:
// - pelo menos 1.000 kg;
// - e representar aproximadamente 10% da capacidade do veículo.
const limiteCargaPesada = Math.max(
  1000,
  veiculo.pesoMax * 0.1
);

// Região operacional estimada dos eixos:
// entre 55% e 70% do comprimento útil,
// medidos a partir da cabine.
const inicioZonaEixos = veiculo.compFisico * 0.55;
const fimZonaEixos = veiculo.compFisico * 0.7;
const centroZonaEixos =
  (inicioZonaEixos + fimZonaEixos) / 2;

caixasIndividuais.forEach((caixa) => {
  caixa.ehCargaPesada =
    caixa.pesoBloco >= limiteCargaPesada;
});

console.group("C3 — Classificação operacional");

console.log(
  "Limite para carga pesada:",
  Number(limiteCargaPesada.toFixed(2)),
  "kg"
);

console.log("Zona estimada dos eixos:", {
  inicioMetros: Number(inicioZonaEixos.toFixed(2)),
  fimMetros: Number(fimZonaEixos.toFixed(2)),
  centroMetros: Number(centroZonaEixos.toFixed(2)),
});

caixasIndividuais.forEach((caixa) => {
  console.log({
    item: caixa.nome,
    pesoBlocoKg: caixa.pesoBloco,
    classificacao: caixa.ehCargaPesada
      ? "PESADA — priorizar região dos eixos"
      : "LEVE — distribuir entre frente e traseira",
  });
});

// console.groupEnd();

let espaçosLivres = [
  {
    x: 0,
    y: 0,
    comp: veiculo.compFisico,
    larg: veiculo.largFisica,
  },
];

let caixasPosicionadas = [];

/*
  As cargas pesadas são processadas primeiro.

  Depois, as cargas leves ocupam os espaços restantes
  em linhas, priorizando o menor Y e avançando no eixo X.
*/
caixasIndividuais.sort((a, b) => {
  if (a.ehCargaPesada !== b.ehCargaPesada) {
    return a.ehCargaPesada ? -1 : 1;
  }

  return (
    b.pesoBloco - a.pesoBloco ||
    b.area - a.area ||
    b.comp - a.comp
  );
});

/*
  Remove a área ocupada de todos os espaços livres.

  Isso evita espaços sobrepostos e impede que duas cargas
  sejam posicionadas fisicamente na mesma região.
*/
function removerAreaOcupada(areaOcupada) {
  const novosEspacos = [];

  espaçosLivres.forEach((espaco) => {
    const inicioIntersecaoX = Math.max(
      espaco.x,
      areaOcupada.x,
    );

    const fimIntersecaoX = Math.min(
      espaco.x + espaco.comp,
      areaOcupada.x + areaOcupada.comp,
    );

    const inicioIntersecaoY = Math.max(
      espaco.y,
      areaOcupada.y,
    );

    const fimIntersecaoY = Math.min(
      espaco.y + espaco.larg,
      areaOcupada.y + areaOcupada.larg,
    );

    const existeIntersecao =
      fimIntersecaoX > inicioIntersecaoX + 0.01 &&
      fimIntersecaoY > inicioIntersecaoY + 0.01;

    if (!existeIntersecao) {
      novosEspacos.push(espaco);
      return;
    }

    const espacoEsquerda = {
      x: espaco.x,
      y: espaco.y,
      comp: inicioIntersecaoX - espaco.x,
      larg: espaco.larg,
    };

    const espacoDireita = {
      x: fimIntersecaoX,
      y: espaco.y,
      comp:
        espaco.x +
        espaco.comp -
        fimIntersecaoX,
      larg: espaco.larg,
    };

    const espacoAbaixo = {
      x: inicioIntersecaoX,
      y: espaco.y,
      comp:
        fimIntersecaoX -
        inicioIntersecaoX,
      larg:
        inicioIntersecaoY -
        espaco.y,
    };

    const espacoAcima = {
      x: inicioIntersecaoX,
      y: fimIntersecaoY,
      comp:
        fimIntersecaoX -
        inicioIntersecaoX,
      larg:
        espaco.y +
        espaco.larg -
        fimIntersecaoY,
    };

    [
      espacoEsquerda,
      espacoDireita,
      espacoAbaixo,
      espacoAcima,
    ].forEach((novoEspaco) => {
      if (
        novoEspaco.comp > 0.01 &&
        novoEspaco.larg > 0.01
      ) {
        novosEspacos.push(novoEspaco);
      }
    });
  });

  espaçosLivres = novosEspacos;
}

function tentarArrumacaoCompacta(caixasOriginais) {
  const caixasTeste = caixasOriginais
    .map((caixa) => ({ ...caixa }))
    .sort(
      (a, b) =>
        b.comp - a.comp ||
        b.area - a.area,
    );

  let espacosFallback = [
    {
      x: 0,
      y: 0,
      comp: veiculo.compFisico,
      larg: veiculo.largFisica,
    },
  ];

  const posicionadasFallback = [];

  for (const caixa of caixasTeste) {
    let encaixou = false;

    for (let i = 0; i < espacosFallback.length; i++) {
      const espaco = espacosFallback[i];

      const orientacoesFallback = [
  {
    comp: caixa.comp,
    larg: caixa.larg,
  },
];

      for (const orientacao of orientacoesFallback) {
        const cabe =
          orientacao.comp <= espaco.comp + 0.01 &&
          orientacao.larg <= espaco.larg + 0.01;

        if (!cabe) {
          continue;
        }

        caixa.X_Fisico = espaco.x;
        caixa.Y_Fisico = espaco.y;

        caixa.compRender = orientacao.comp;
        caixa.largRender = orientacao.larg;

        const espacoDireita = {
          x: espaco.x + orientacao.comp,
          y: espaco.y,
          comp: espaco.comp - orientacao.comp,
          larg: espaco.larg,
        };

        const espacoCima = {
          x: espaco.x,
          y: espaco.y + orientacao.larg,
          comp: orientacao.comp,
          larg: espaco.larg - orientacao.larg,
        };

        espacosFallback.splice(i, 1);

        if (
          espacoDireita.comp > 0.01 &&
          espacoDireita.larg > 0.01
        ) {
          espacosFallback.push(espacoDireita);
        }

        if (
          espacoCima.comp > 0.01 &&
          espacoCima.larg > 0.01
        ) {
          espacosFallback.push(espacoCima);
        }

        espacosFallback.sort(
          (a, b) =>
            a.x - b.x ||
            a.y - b.y,
        );

        posicionadasFallback.push(caixa);

        encaixou = true;
        break;
      }

      if (encaixou) {
        break;
      }
    }

    if (!encaixou) {
      return null;
    }
  }

  /*
    C3 - BALANCEAMENTO DO FALLBACK

    O fallback já encontrou uma disposição fisicamente válida.

    Agora, entre blocos que possuem exatamente a mesma
    ocupação no piso, redistribuímos apenas qual carga ocupa
    cada posição.

    Isso mantém:
    - a geometria;
    - os espaços encontrados;
    - ausência de colisões;

    mas coloca os blocos mais pesados nas posições mais
    próximas da região estimada dos eixos.
  */

  const menorXFallback = Math.min(
    ...posicionadasFallback.map(
      (caixa) => caixa.X_Fisico,
    ),
  );

  const maiorXFallback = Math.max(
    ...posicionadasFallback.map(
      (caixa) =>
        caixa.X_Fisico + caixa.compRender,
    ),
  );

  const comprimentoOcupadoFallback =
    maiorXFallback - menorXFallback;

  /*
    O renderizador centraliza posteriormente o conjunto.

    Calculamos aqui esse deslocamento antecipadamente apenas
    para avaliar corretamente qual posição ficará mais próxima
    da região dos eixos depois da centralização.
  */
  const deslocamentoPrevistoX =
    (veiculo.compFisico - comprimentoOcupadoFallback) / 2 -
    menorXFallback;

  const gruposPorDimensao = {};

  posicionadasFallback.forEach((caixa) => {
    const chave =
      `${caixa.compRender.toFixed(4)}|${caixa.largRender.toFixed(4)}`;

    if (!gruposPorDimensao[chave]) {
      gruposPorDimensao[chave] = [];
    }

    gruposPorDimensao[chave].push(caixa);
  });

  Object.values(gruposPorDimensao).forEach((grupo) => {
    if (grupo.length < 2) {
      return;
    }

    /*
      Guardamos somente as posições físicas já validadas
      pelo fallback.
    */
    const posicoes = grupo
      .map((caixa) => ({
        x: caixa.X_Fisico,
        y: caixa.Y_Fisico,
        comp: caixa.compRender,
        larg: caixa.largRender,
      }))
      .sort((a, b) => {
        const centroA =
          a.x +
          deslocamentoPrevistoX +
          a.comp / 2;

        const centroB =
          b.x +
          deslocamentoPrevistoX +
          b.comp / 2;

        return (
          Math.abs(centroA - centroZonaEixos) -
          Math.abs(centroB - centroZonaEixos)
        );
      });

    /*
      Mais pesado primeiro.
    */
    const caixasOrdenadas = [...grupo].sort(
      (a, b) =>
        b.pesoBloco - a.pesoBloco,
    );

    /*
      A carga mais pesada recebe a posição válida mais
      próxima da região dos eixos.

      Nenhuma nova geometria é criada aqui.
    */
    caixasOrdenadas.forEach((caixa, index) => {
      const posicao = posicoes[index];

      caixa.X_Fisico = posicao.x;
      caixa.Y_Fisico = posicao.y;
      caixa.compRender = posicao.comp;
      caixa.largRender = posicao.larg;
    });
  });

  return posicionadasFallback;
}

const caixasProcessadasEmGrupo = new Set();

caixasIndividuais.forEach((caixa, indiceCaixa) => {

  // Se esta caixa já foi posicionada junto com outra
  // unidade igual, não processa novamente.
  if (caixasProcessadasEmGrupo.has(caixa)) {
    return;
  }

  // =====================================================
  // C4 - AGRUPAMENTO TRANSVERSAL PRÉVIO
  //
  // Para cargas leves iguais, tenta posicionar duas
  // unidades juntas transversalmente:
  //
  // [ B ]
  // [ B ]
  //
  // A orientação original informada pelo usuário
  // é preservada. Nenhuma rotação automática é feita.
  // =====================================================

  const caixaParceira =
    caixasIndividuais.find(
      (outraCaixa, indiceOutra) =>
        indiceOutra !== indiceCaixa &&
        !caixasProcessadasEmGrupo.has(outraCaixa) &&
        outraCaixa.id === caixa.id &&
        !caixa.ehCargaPesada &&
        !outraCaixa.ehCargaPesada &&
        Math.abs(outraCaixa.comp - caixa.comp) <= 0.01 &&
        Math.abs(outraCaixa.larg - caixa.larg) <= 0.01
    );

  if (caixaParceira) {

    const compGrupo = caixa.comp;

    const largGrupo =
      caixa.larg +
      caixaParceira.larg;

    let melhorPosicaoGrupo = null;

    espaçosLivres.forEach((espaco) => {

      const grupoCabe =
        compGrupo <= espaco.comp + 0.01 &&
        largGrupo <= espaco.larg + 0.01;

      if (!grupoCabe) {
        return;
      }

      const posicaoXGrupo = espaco.x;
      const posicaoYGrupo = espaco.y;

      // ---------------------------------------------
      // Calcula o CG lateral existente
      // ---------------------------------------------

      let pesoJaPosicionado = 0;
      let momentoLateralAtual = 0;

      caixasPosicionadas.forEach((caixaPosicionada) => {

        const centroY =
          caixaPosicionada.Y_Fisico +
          caixaPosicionada.largRender / 2;

        pesoJaPosicionado +=
          caixaPosicionada.pesoBloco;

        momentoLateralAtual +=
          centroY *
          caixaPosicionada.pesoBloco;
      });

      // Centro lateral da primeira unidade
      const centroYCaixa1 =
        posicaoYGrupo +
        caixa.larg / 2;

      // Centro lateral da segunda unidade
      const centroYCaixa2 =
        posicaoYGrupo +
        caixa.larg +
        caixaParceira.larg / 2;

      const pesoProjetado =
        pesoJaPosicionado +
        caixa.pesoBloco +
        caixaParceira.pesoBloco;

      const momentoProjetado =
        momentoLateralAtual +
        centroYCaixa1 * caixa.pesoBloco +
        centroYCaixa2 * caixaParceira.pesoBloco;

      const cgLateralProjetado =
        pesoProjetado > 0
          ? momentoProjetado / pesoProjetado
          : veiculo.largFisica / 2;

      const desvioProjetado =
        Math.abs(
          cgLateralProjetado -
          veiculo.largFisica / 2
        );

      const desperdicioGrupo =
        espaco.comp * espaco.larg -
        compGrupo * largGrupo;

      const pontuacaoGrupo =
        desvioProjetado * 1000000 +
        espaco.y * 1000 +
        espaco.x * 100 +
        desperdicioGrupo;

      if (
        melhorPosicaoGrupo === null ||
        pontuacaoGrupo < melhorPosicaoGrupo.pontuacao
      ) {
        melhorPosicaoGrupo = {
          x: posicaoXGrupo,
          y: posicaoYGrupo,
          pontuacao: pontuacaoGrupo,
        };
      }
    });

    // =====================================================
    // Se existe espaço para o par, posiciona as duas
    // unidades ao mesmo tempo.
    // =====================================================

    if (melhorPosicaoGrupo) {

      caixa.X_Fisico =
        melhorPosicaoGrupo.x;

      caixa.Y_Fisico =
        melhorPosicaoGrupo.y;

      caixa.compRender =
        caixa.comp;

      caixa.largRender =
        caixa.larg;


      caixaParceira.X_Fisico =
        melhorPosicaoGrupo.x;

      caixaParceira.Y_Fisico =
        melhorPosicaoGrupo.y +
        caixa.larg;

      caixaParceira.compRender =
        caixaParceira.comp;

      caixaParceira.largRender =
        caixaParceira.larg;


      caixasPosicionadas.push(
        caixa,
        caixaParceira
      );

      caixasProcessadasEmGrupo.add(caixa);
      caixasProcessadasEmGrupo.add(caixaParceira);

      removerAreaOcupada({
        x: melhorPosicaoGrupo.x,
        y: melhorPosicaoGrupo.y,
        comp: compGrupo,
        larg: largGrupo,
      });

      return;
    }
  }

  // Se não existir espaço físico para o agrupamento,
  // segue normalmente com o posicionamento individual.

  let melhorPosicao = null;

  espaçosLivres.forEach((espaco) => {
  const orientacoes = [
  {
    comp: caixa.comp,
    larg: caixa.larg,
  },
];

    orientacoes.forEach((orientacao) => {
      const cabeNoEspaco =
        orientacao.comp <= espaco.comp + 0.01 &&
        orientacao.larg <= espaco.larg + 0.01;

      if (!cabeNoEspaco) {
        return;
      }

      let posicaoX = espaco.x;
      let posicaoY = espaco.y;
      let pontuacao = 0;

      if (caixa.ehCargaPesada) {
        const posicaoIdealX =
          centroZonaEixos -
          orientacao.comp / 2;

        const posicaoIdealY =
          veiculo.largFisica / 2 -
          orientacao.larg / 2;

        const maximoX =
          espaco.x +
          espaco.comp -
          orientacao.comp;

        const maximoY =
          espaco.y +
          espaco.larg -
          orientacao.larg;

        posicaoX = Math.max(
          espaco.x,
          Math.min(posicaoIdealX, maximoX),
        );

        posicaoY = Math.max(
          espaco.y,
          Math.min(posicaoIdealY, maximoY),
        );

        const centroCargaX =
          posicaoX +
          orientacao.comp / 2;

        const centroCargaY =
          posicaoY +
          orientacao.larg / 2;

        const distanciaEixos = Math.abs(
          centroCargaX -
          centroZonaEixos,
        );

        const distanciaLateral = Math.abs(
          centroCargaY -
          veiculo.largFisica / 2,
        );

        const desperdicio =
          espaco.comp * espaco.larg -
          orientacao.comp * orientacao.larg;

        pontuacao =
          distanciaEixos * 1000 +
          distanciaLateral * 100 +
          desperdicio;
      } else {
        /*
          Carga leve:

          1. prioriza a linha mais baixa;
          2. avança da esquerda para a direita;
          3. prefere orientação normal;
          4. usa o menor espaço suficiente.
        */
       const desperdicio =
  espaco.comp * espaco.larg -
  orientacao.comp * orientacao.larg;

// =====================================================
// C4 - BALANCEAMENTO LATERAL PREDITIVO
//
// Em vez de centralizar esta caixa isoladamente,
// estima como ficará o CG lateral do conjunto caso
// esta posição seja escolhida.
// =====================================================

let pesoJaPosicionado = 0;
let momentoLateralAtual = 0;

caixasPosicionadas.forEach((caixaPosicionada) => {
  const centroYCaixaPosicionada =
    caixaPosicionada.Y_Fisico +
    caixaPosicionada.largRender / 2;

  pesoJaPosicionado +=
    caixaPosicionada.pesoBloco;

  momentoLateralAtual +=
    centroYCaixaPosicionada *
    caixaPosicionada.pesoBloco;
});

const centroCargaY =
  posicaoY +
  orientacao.larg / 2;

const pesoProjetado =
  pesoJaPosicionado +
  caixa.pesoBloco;

const momentoLateralProjetado =
  momentoLateralAtual +
  centroCargaY *
  caixa.pesoBloco;

const cgLateralProjetado =
  pesoProjetado > 0
    ? momentoLateralProjetado / pesoProjetado
    : veiculo.largFisica / 2;

const desvioCgLateralProjetado =
  Math.abs(
    cgLateralProjetado -
    veiculo.largFisica / 2
  );

      }

      if (
        melhorPosicao === null ||
        pontuacao < melhorPosicao.pontuacao
      ) {
        melhorPosicao = {
          posicaoX,
          posicaoY,
          comp: orientacao.comp,
          larg: orientacao.larg,
          pontuacao,
        };
      }
    });
  });

  if (melhorPosicao) {
    caixa.X_Fisico =
      melhorPosicao.posicaoX;

    caixa.Y_Fisico =
      melhorPosicao.posicaoY;

    caixa.compRender =
      melhorPosicao.comp;

    caixa.largRender =
      melhorPosicao.larg;

    caixasPosicionadas.push(caixa);

    removerAreaOcupada({
      x: caixa.X_Fisico,
      y: caixa.Y_Fisico,
      comp: caixa.compRender,
      larg: caixa.largRender,
    });

    return;
  }

  if (posicionarCaixaComAET(caixa, veiculo)) {
    caixasPosicionadas.push(caixa);
    return;
  }

  globalEstorouMetragem = true;
  globalItensExcedentes.push(caixa);

  caixa.X_Fisico =
    veiculo.compFisico +
    0.2 +
    (globalItensExcedentes.length - 1) *
      (caixa.comp + 0.15);

  caixa.Y_Fisico = 0;
  caixa.compRender = caixa.comp;
  caixa.largRender = caixa.larg;

  caixasPosicionadas.push(caixa);
});

/*
  C3 - FALLBACK DE ARRUMAÇÃO FÍSICA

  Se a distribuição otimizada por peso não conseguiu
  acomodar todos os blocos, tenta novamente usando uma
  arrumação compacta puramente geométrica.

  Assim, uma tentativa ruim de balanceamento não faz uma
  carga fisicamente compatível ser considerada excedente.
*/

let usouFallbackFisico = false;

if (globalEstorouMetragem) {
  const arrumacaoFallback =
    tentarArrumacaoCompacta(caixasIndividuais);

  if (arrumacaoFallback) {
    console.log(
      "C3 — distribuição por peso não encontrou encaixe. Aplicado fallback físico.",
    );

caixasPosicionadas = arrumacaoFallback;
globalEstorouMetragem = false;
globalItensExcedentes = [];

usouFallbackFisico = true;
  }
}

if (!globalEstorouMetragem && caixasPosicionadas.length > 0) {
    const caixasDentroDoVeiculo = caixasPosicionadas.filter(
      (caixa) =>
        !caixa.excessoAET &&
        caixa.X_Fisico >= 0 &&
        caixa.Y_Fisico >= 0 &&
        caixa.X_Fisico + caixa.compRender <=
          veiculo.compFisico + 0.01 &&
        caixa.Y_Fisico + caixa.largRender <=
          veiculo.largFisica + 0.01,
    );

    if (caixasDentroDoVeiculo.length > 0) {
      const menorX = Math.min(
        ...caixasDentroDoVeiculo.map(
          (caixa) => caixa.X_Fisico,
        ),
      );

      const maiorX = Math.max(
        ...caixasDentroDoVeiculo.map(
          (caixa) =>
            caixa.X_Fisico + caixa.compRender,
        ),
      );

      const menorY = Math.min(
        ...caixasDentroDoVeiculo.map(
          (caixa) => caixa.Y_Fisico,
        ),
      );

      const maiorY = Math.max(
        ...caixasDentroDoVeiculo.map(
          (caixa) =>
            caixa.Y_Fisico + caixa.largRender,
        ),
      );

      const comprimentoOcupado = maiorX - menorX;
const larguraOcupada = maiorY - menorY;

/*
  C3 - AJUSTE FINAL PELO CENTRO DE GRAVIDADE

  A arrumação física já foi validada neste ponto.

  Em vez de simplesmente centralizar o conjunto pelo seu
  tamanho geométrico, calculamos o CG longitudinal atual
  e deslocamos TODO o conjunto para aproximá-lo do centro
  estimado da região dos eixos.

  Como todas as cargas se movem juntas:
  - não surgem colisões;
  - nenhuma posição relativa é alterada;
  - a arrumação física continua válida.
*/

let pesoTotalAjusteCG = 0;
let momentoXAjusteCG = 0;

caixasDentroDoVeiculo.forEach((caixa) => {
  const centroBlocoX =
    caixa.X_Fisico +
    caixa.compRender / 2;

  pesoTotalAjusteCG += caixa.pesoBloco;

  momentoXAjusteCG +=
    centroBlocoX *
    caixa.pesoBloco;
});

let cgAtualX = veiculo.compFisico / 2;

if (pesoTotalAjusteCG > 0) {
  cgAtualX =
    momentoXAjusteCG /
    pesoTotalAjusteCG;
}

/*
  Movimento necessário para levar o CG ao centro
  estimado da região dos eixos.
*/
const deslocamentoIdealX =
  centroZonaEixos - cgAtualX;

/*
  Limites físicos para deslocar TODO o conjunto
  sem ultrapassar a frente ou a traseira do veículo.
*/
const deslocamentoMinimoX =
  -menorX;

const deslocamentoMaximoX =
  veiculo.compFisico - maiorX;

/*
  Usa o deslocamento ideal quando possível.

  Caso não exista espaço suficiente, utiliza o maior
  deslocamento fisicamente permitido.
*/
const deslocamentoX = Math.max(
  deslocamentoMinimoX,
  Math.min(
    deslocamentoIdealX,
    deslocamentoMaximoX,
  ),
);

/*
  No eixo lateral continuamos centralizando
  geometricamente por enquanto.
*/
const deslocamentoY =
  (veiculo.largFisica - larguraOcupada) / 2 - menorY;

console.log("C3 — ajuste final pelo CG:", {
  cgAntesMetros:
    Number(cgAtualX.toFixed(2)),

  alvoMetros:
    Number(centroZonaEixos.toFixed(2)),

  deslocamentoIdealMetros:
    Number(deslocamentoIdealX.toFixed(2)),

  deslocamentoAplicadoMetros:
    Number(deslocamentoX.toFixed(2)),
});

caixasDentroDoVeiculo.forEach((caixa) => {
  caixa.X_Fisico += deslocamentoX;
  caixa.Y_Fisico += deslocamentoY;
});
    }
  }

  // =====================================================
  // C3 - DIAGNÓSTICO DOS BLOCOS E PESOS
  // =====================================================

  // console.group(`C3 — Distribuição de peso: ${veiculo.nome}`);

  let pesoTotalBlocos = 0;

  caixasPosicionadas.forEach((caixa, index) => {
    pesoTotalBlocos += caixa.pesoBloco;

console.log(`Bloco ${index + 1}`, {
  item: caixa.nome,
  id: caixa.id,

  quantidadeEmpilhada:
    caixa.empilhados,

  alturaTotalMetros:
    Number(
      (caixa.alturaTotal || 0).toFixed(2)
    ),

  composicaoPilha:
    Array.isArray(caixa.unidades)
      ? caixa.unidades.map((unidade) => ({
          id: unidade.id,
          nome: unidade.nome,
          alturaMetros:
            Number(
              (unidade.alt || 0).toFixed(2)
            ),
          pesoKg: unidade.peso,
        }))
      : [],

  pesoUnitarioKg:
    caixa.pesoUnitario,

  pesoBlocoKg:
    caixa.pesoBloco,

  posicaoXMetros:
    Number(
      caixa.X_Fisico.toFixed(2)
    ),

  posicaoYMetros:
    Number(
      caixa.Y_Fisico.toFixed(2)
    ),

  comprimentoMetros:
    Number(
      caixa.compRender.toFixed(2)
    ),

  larguraMetros:
    Number(
      caixa.largRender.toFixed(2)
    ),
});
  });

    console.log("Peso total dos blocos:", pesoTotalBlocos, "kg");

  // =====================================================
  // C3 - CÁLCULO DO CENTRO DE GRAVIDADE
  // =====================================================

  let somaMomentoX = 0;
  let somaMomentoY = 0;

  caixasPosicionadas.forEach((caixa) => {
    const centroBlocoX =
      caixa.X_Fisico + caixa.compRender / 2;

    const centroBlocoY =
      caixa.Y_Fisico + caixa.largRender / 2;

    somaMomentoX += centroBlocoX * caixa.pesoBloco;
    somaMomentoY += centroBlocoY * caixa.pesoBloco;
  });

  let centroGravidadeX = 0;
  let centroGravidadeY = 0;

  if (pesoTotalBlocos > 0) {
    centroGravidadeX = somaMomentoX / pesoTotalBlocos;
    centroGravidadeY = somaMomentoY / pesoTotalBlocos;
  }

  // console.group("Centro de Gravidade");

  console.log(
    "CG longitudinal (X):",
    Number(centroGravidadeX.toFixed(2)),
    "m"
  );

  console.log(
    "CG lateral (Y):",
    Number(centroGravidadeY.toFixed(2)),
    "m"
  );
  
// =====================================================
// C4 - ANÁLISE TRANSVERSAL / LATERAL
// Diagnóstico experimental
// =====================================================

const centroLateralVeiculo =
  veiculo.largFisica / 2;

const desvioLateralMetros =
  centroGravidadeY - centroLateralVeiculo;

const desvioLateralAbsoluto =
  Math.abs(desvioLateralMetros);

const meiaLarguraUtil =
  veiculo.largFisica / 2;

const desvioLateralPercentual =
  meiaLarguraUtil > 0
    ? (desvioLateralAbsoluto / meiaLarguraUtil) * 100
    : 0;

let ladoDesvioLateral = "CENTRAL";

if (desvioLateralMetros < -0.01) {
  ladoDesvioLateral = "ESQUERDA";
} else if (desvioLateralMetros > 0.01) {
  ladoDesvioLateral = "DIREITA";
}

console.group("C4 - análise transversal")

console.log(
  "CG lateral:",
  Number(centroGravidadeY.toFixed(2)),
  "m"
);

console.log(
  "Centro lateral do veículo:",
  Number(centroLateralVeiculo.toFixed(2)),
  "m"
);

console.log(
  "Desvio lateral:",
  Number(desvioLateralAbsoluto.toFixed(2)),
  "m"
);

console.log(
  "Desvio relativo:",
  Number(desvioLateralPercentual.toFixed(2)),
  "%"
);

console.log(
  "Lado:",
  ladoDesvioLateral
);

console.groupEnd();

// =====================================================
// C4 - CLASSIFICAÇÃO OPERACIONAL TRANSVERSAL
// Critério interno de triagem matemática do DCPRO
// =====================================================

let nivelTransversalCg = "";
let classificacaoTransversalCg = "";

if (desvioLateralPercentual <= 10) {
  nivelTransversalCg = "adequado";
  classificacaoTransversalCg =
    "ADEQUADO - distribuição lateral próxima do centro";
} else if (desvioLateralPercentual <= 25) {
  nivelTransversalCg = "atencao";
  classificacaoTransversalCg =
    "ATENÇÃO - concentração lateral afastada da região central";
} else {
  nivelTransversalCg = "critico";
  classificacaoTransversalCg =
    "CRÍTICO - concentração lateral significativamente afastada da região central";
}

console.log(
  "C4 - classificação transversal:",
  {
    desvioPercentual:
      Number(desvioLateralPercentual.toFixed(2)),

    lado:
      ladoDesvioLateral,

    nivel:
      nivelTransversalCg,

    classificacao:
      classificacaoTransversalCg,
  },
);

// C4 - mensagem operacional da análise transversal
let mensagemTransversalCg = null;

if (nivelTransversalCg === "atencao") {
  mensagemTransversalCg = {
    nivel: "atencao",
    titulo: "ATENÇÃO À DISTRIBUIÇÃO LATERAL DA CARGA",
    mensagem:
      `A distribuição estimada da carga apresenta concentração lateral para o lado ${ladoDesvioLateral.toLowerCase()}. ` +
      "Recomenda-se revisar o posicionamento da carga antes da operação.",
  };

} else if (nivelTransversalCg === "critico") {
  mensagemTransversalCg = {
    nivel: "critico",
    titulo: "DISTRIBUIÇÃO LATERAL CRÍTICA DA CARGA",
    mensagem:
      `A distribuição estimada da carga apresenta concentração lateral significativa para o lado ${ladoDesvioLateral.toLowerCase()}. ` +
      "Recomenda-se revisar a disposição da carga antes de prosseguir.",
  };
}

console.log(
  "C4 - mensagem operacional transversal:",
  mensagemTransversalCg,
);

mensagemTransversalCgAtual = mensagemTransversalCg;

/*
  C3 - CLASSIFICAÇÃO DO EQUILÍBRIO LONGITUDINAL

  Compara o CG longitudinal final da carga com o centro
  estimado da região dos eixos.

  Esta classificação é interna e experimental.
*/

const diferencaCgEixos =
  Math.abs(
    centroGravidadeX - centroZonaEixos,
  );

let classificacaoCg = "";
let nivelCg = "";

if (diferencaCgEixos <= 0.5) {
  classificacaoCg =
    "ADEQUADO - CG próximo da região dos eixos";

  nivelCg = "adequado";
} else if (diferencaCgEixos <= 1) {
  classificacaoCg =
    "ATENÇÃO - CG afastado da região ideal";

  nivelCg = "atencao";
} else {
  classificacaoCg =
    "CRÍTICO - revisar distribuição da carga";

  nivelCg = "critico";
}

console.log(
  "C3 - avaliação do CG:",
  {
    cgLongitudinalMetros:
  Number(
    centroGravidadeX.toFixed(2),
  ),

    alvoEixosMetros:
      Number(
        centroZonaEixos.toFixed(2),
      ),

    diferencaMetros:
      Number(
        diferencaCgEixos.toFixed(2),
      ),

    nivel:
      nivelCg,

    classificacao:
      classificacaoCg,
  },
);

// =====================================================
// C4 - ANÁLISE LONGITUDINAL DA POSIÇÃO DO CG
// =====================================================

const percentualPosicaoCg =
  (centroGravidadeX / veiculo.compFisico) * 100;

let regiaoLongitudinalCg = "";
let tendenciaLongitudinalCg = "";

if (percentualPosicaoCg < 33.33) {
  regiaoLongitudinalCg = "DIANTEIRA";
  tendenciaLongitudinalCg =
    "Concentração de peso com tendência para a região dianteira";
} else if (percentualPosicaoCg <= 66.66) {
  regiaoLongitudinalCg = "CENTRAL";
  tendenciaLongitudinalCg =
    "Concentração de peso predominantemente na região central";
} else {
  regiaoLongitudinalCg = "TRASEIRA";
  tendenciaLongitudinalCg =
    "Concentração de peso com tendência para a região traseira";
}

console.log(
  "C4 - análise longitudinal:",
  {
    posicaoCgMetros:
      Number(centroGravidadeX.toFixed(2)),

    comprimentoUtilMetros:
      Number(veiculo.compFisico.toFixed(2)),

    posicaoPercentual:
      Number(percentualPosicaoCg.toFixed(2)),

    regiao:
      regiaoLongitudinalCg,

    tendencia:
      tendenciaLongitudinalCg,
  },
);

// =====================================================
// C4 - ORIENTAÇÃO OPERACIONAL LONGITUDINAL
// =====================================================

let orientacaoLongitudinalCg = null;

if (regiaoLongitudinalCg === "DIANTEIRA") {
  orientacaoLongitudinalCg = {
    regiao: "dianteira",
    titulo: "CONCENTRAÇÃO LONGITUDINAL DIANTEIRA",
    mensagem:
      "A distribuição estimada apresenta maior concentração de peso na região dianteira do espaço útil. Recomenda-se verificar o posicionamento da carga antes da operação.",
  };
} else if (regiaoLongitudinalCg === "TRASEIRA") {
  orientacaoLongitudinalCg = {
    regiao: "traseira",
    titulo: "CONCENTRAÇÃO LONGITUDINAL TRASEIRA",
    mensagem:
      "A distribuição estimada apresenta maior concentração de peso na região traseira do espaço útil. Recomenda-se verificar o posicionamento da carga antes da operação.",
  };
}

console.log(
  "C4 - orientação operacional:",
  orientacaoLongitudinalCg,
);

orientacaoLongitudinalCgAtual =
  orientacaoLongitudinalCg;

/*
  C3 - RESSALVA OPERACIONAL DO CENTRO DE GRAVIDADE

  Gera uma orientação para a interface quando
  o CG final não estiver classificado como adequado.

  Esta análise é estimada e não substitui a
  verificação operacional da distribuição por eixo.
*/

let ressalvaCg = null;

if (nivelCg === "atencao") {
  ressalvaCg = {
    nivel: "atencao",

    titulo:
      "ATENÇÃO À DISTRIBUIÇÃO DA CARGA",

    mensagem:
      "O centro de gravidade estimado ficou afastado da região ideal. Revise o posicionamento da carga antes da operação.",
  };
} else if (nivelCg === "critico") {
  ressalvaCg = {
    nivel: "critico",

    titulo:
      "DISTRIBUIÇÃO CRÍTICA DA CARGA",

    mensagem:
      "O centro de gravidade estimado ficou significativamente afastado da região ideal. Recomenda-se revisar a disposição da carga antes de prosseguir.",
  };
}

console.log(
  "C3 - ressalva operacional do CG:",
  ressalvaCg,
);

ressalvaCgAtual = ressalvaCg;

/*
  C3 - DIAGNÓSTICO OPERACIONAL CONSOLIDADO

  Centraliza os principais resultados da análise
  de distribuição de peso e centro de gravidade.

  Este objeto será usado futuramente por:
  - interface;
  - alertas;
  - PDF;
  - Excel;
  - relatórios operacionais.
*/

/*
  C3 - CLASSIFICAÇÃO DA MARGEM OPERACIONAL DE PESO

  Analisa quanto da capacidade máxima cadastrada
  do veículo está sendo utilizada pela carga.
*/

const percentualPeso =
  pesoTotalBlocos / veiculo.pesoMax;

let nivelMargemPeso = "";
let classificacaoMargemPeso = "";

if (percentualPeso <= LIMITE_PESO_NORMAL) {
  nivelMargemPeso = "normal";

  classificacaoMargemPeso =
    "NORMAL - dentro da margem operacional";
} else if (percentualPeso <= LIMITE_PESO_ATENCAO) {
  nivelMargemPeso = "atencao";

  classificacaoMargemPeso =
    "ATENÇÃO - aproximação do limite operacional";
} else if (percentualPeso <= 1) {
  nivelMargemPeso = "limite";

  classificacaoMargemPeso =
    "LIMITE OPERACIONAL - avaliar veículo maior ou fracionamento";
} else {
  nivelMargemPeso = "incompativel";

  classificacaoMargemPeso =
    "INCOMPATÍVEL - capacidade máxima de peso excedida";
}

console.log(
  "C3 - margem operacional de peso:",
  {
    pesoTotalKg:
      Number(
        pesoTotalBlocos.toFixed(2),
      ),

    capacidadeMaximaKg:
      Number(
        veiculo.pesoMax.toFixed(2),
      ),

    ocupacaoPercentual:
      Number(
        (percentualPeso * 100).toFixed(2),
      ),

    nivel:
      nivelMargemPeso,

    classificacao:
      classificacaoMargemPeso,
  },
);

const diagnosticoCg = {
  pesoTotalKg:
    Number(
      pesoTotalBlocos.toFixed(2),
    ),

  cgLongitudinalMetros:
    Number(
      centroGravidadeX.toFixed(2),
    ),

  cgLateralMetros:
    Number(
      centroGravidadeY.toFixed(2),
    ),

  centroGeometricoXMetros:
    Number(
      (veiculo.compFisico / 2).toFixed(2),
    ),

  centroGeometricoYMetros:
    Number(
      (veiculo.largFisica / 2).toFixed(2),
    ),

  zonaEixos: {
    inicioMetros:
      Number(
        inicioZonaEixos.toFixed(2),
      ),

    fimMetros:
      Number(
        fimZonaEixos.toFixed(2),
      ),

    centroMetros:
      Number(
        centroZonaEixos.toFixed(2),
      ),
  },

  diferencaCgEixosMetros:
    Number(
      diferencaCgEixos.toFixed(2),
    ),

  nivel:
    nivelCg,

  classificacao:
    classificacaoCg,
};

console.log(
  "C3 - diagnóstico operacional:",
  diagnosticoCg,
);

  console.log(
    "Centro geométrico do veículo:",
    {
      x: Number((veiculo.compFisico / 2).toFixed(2)),
      y: Number((veiculo.largFisica / 2).toFixed(2)),
    }
  );

  console.groupEnd();
  console.groupEnd();

  let maiorX = larguraBauPixels;

caixasPosicionadas.forEach((c) => {
  const fimCaixa =
    (c.X_Fisico + c.compRender) * escalaGlobalX;

  if (fimCaixa > maiorX) {
    maiorX = fimCaixa;
  }
});

let tamanhoFinalW = Math.max(
  maiorX + margemBorda * 2 + 30,
  900
);

  const offsetX = (tamanhoFinalW - larguraBauPixels) / 2;
  const offsetY = margemBorda;

  svgCima.setAttribute("width", tamanhoFinalW);
  svgCima.setAttribute("height", alturaBauPixels + margemBorda * 2 + 110);

  if (globalEstorouMetragem) {
    txtDimensoes.className = "dimensoes-bau-tag estourou";
    txtDimensoes.innerHTML = `⚠️ EXCESSO DE METRAGEM LINEAR (${veiculo.nome}): Espaço de ${veiculo.compFisico.toFixed(2)}m esgotado! Carga transbordando para fora do baú.`;
  } else {
    txtDimensoes.className = "dimensoes-bau-tag";
    txtDimensoes.innerHTML = `📏 Espaço Útil do Baú (${veiculo.nome}): Comprimento: ${veiculo.compFisico.toFixed(2)}m | Largura: ${veiculo.largFisica.toFixed(2)}m | Altura Máx: ${veiculo.altFisica.toFixed(2)}m`;
  }

  let bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("x", offsetX);
  bgRect.setAttribute("y", offsetY);
  bgRect.setAttribute("width", larguraBauPixels);
  bgRect.setAttribute("height", alturaBauPixels);
  bgRect.setAttribute("rx", "8");
  bgRect.setAttribute("ry", "8");
  bgRect.setAttribute("fill", globalEstorouMetragem ? "#fff5f5" : "#f8fafc");
  bgRect.setAttribute("stroke", globalEstorouMetragem ? "#ef4444" : "#1e40af");
  bgRect.setAttribute("stroke-width", "3");
  bgRect.setAttribute("filter", "drop-shadow(0px 4px 6px rgba(15,23,42,0.18))");

  if (globalEstorouMetragem) {
    bgRect.setAttribute("stroke-dasharray", "8,4");
  }

  svgCima.appendChild(bgRect);

  // =====================================================
// CABINE - REFERÊNCIA VISUAL
// Não participa de nenhum cálculo da carga.
// =====================================================

const grupoCabine = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "g"
);

grupoCabine.setAttribute(
  "class",
  "cabine-referencia-visual"
);

const larguraCabine = 85;

const alturaCabine =
  Math.min(alturaBauPixels * 0.82, 135);

const cabineX =
  offsetX - larguraCabine;

const cabineY =
  offsetY +
  (alturaBauPixels - alturaCabine) / 2;

// Corpo da cabine
const cabineCorpo = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "rect"
);

cabineCorpo.setAttribute("x", cabineX);
cabineCorpo.setAttribute("y", cabineY);
cabineCorpo.setAttribute("width", larguraCabine);
cabineCorpo.setAttribute("height", alturaCabine);
cabineCorpo.setAttribute("rx", "10");
cabineCorpo.setAttribute("ry", "10");
cabineCorpo.setAttribute("fill", "#e2e8f0");
cabineCorpo.setAttribute("stroke", "#475569");
cabineCorpo.setAttribute("stroke-width", "2");

grupoCabine.appendChild(cabineCorpo);

// Para-brisa / indicação da frente
const cabineVidro = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "rect"
);

cabineVidro.setAttribute(
  "x",
  cabineX + 7
);

cabineVidro.setAttribute(
  "y",
  cabineY + 8
);

cabineVidro.setAttribute(
  "width",
  "12"
);

cabineVidro.setAttribute(
  "height",
  Math.max(alturaCabine - 16, 10)
);

cabineVidro.setAttribute("rx", "4");
cabineVidro.setAttribute("fill", "#94a3b8");

grupoCabine.appendChild(cabineVidro);

// Tooltip explicativo
const tituloCabine = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "title"
);

tituloCabine.textContent =
  "Cabine - referência visual de orientação. Não participa dos cálculos.";

grupoCabine.appendChild(tituloCabine);

// =====================================================
// C4 - LINHA CENTRAL TRANSVERSAL
// Referência visual do centro da largura útil.
// Não participa dos cálculos da carga.
// =====================================================

const linhaCentralY =
  offsetY + alturaBauPixels / 2;

const linhaCentral = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "line"
);

linhaCentral.setAttribute(
  "x1",
  offsetX
);

linhaCentral.setAttribute(
  "y1",
  linhaCentralY
);

linhaCentral.setAttribute(
  "x2",
  offsetX + larguraBauPixels
);

linhaCentral.setAttribute(
  "y2",
  linhaCentralY
);

linhaCentral.setAttribute(
  "stroke",
  "#64748b"
);

linhaCentral.setAttribute(
  "stroke-width",
  "1.5"
);

linhaCentral.setAttribute(
  "stroke-dasharray",
  "8,6"
);

linhaCentral.setAttribute(
  "opacity",
  "0.75"
);

linhaCentral.setAttribute(
  "pointer-events",
  "none"
);

const tituloLinhaCentral = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "title"
);

tituloLinhaCentral.textContent =
  "Linha central da largura útil do veículo";

linhaCentral.appendChild(
  tituloLinhaCentral
);

svgCima.appendChild(
  linhaCentral
);

svgCima.appendChild(grupoCabine);

  caixasPosicionadas.forEach((c) => {
    let posX = offsetX + c.X_Fisico * escalaGlobalX;
    let posY = offsetY + c.Y_Fisico * escalaGlobalY;
    let widthPX = c.compRender * escalaGlobalX;
    let heightPX = c.largRender * escalaGlobalY;

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", posX);
    rect.setAttribute("y", posY);
    rect.setAttribute("width", widthPX);
    rect.setAttribute("height", heightPX);
    rect.setAttribute("fill", c.cor);
    rect.setAttribute("stroke", "#1f2937");
    rect.setAttribute("stroke-width", "1.0");

    if (c.X_Fisico + c.compRender > veiculo.compFisico) {
      rect.setAttribute("stroke", "#dc2626");
      rect.setAttribute("stroke-width", "2");
    }

    if (c.excessoAET) {
  rect.setAttribute("stroke", "#f97316");
  rect.setAttribute("stroke-width", "3");
  rect.setAttribute("stroke-dasharray", "8,4");
}

    svgCima.appendChild(rect);

    if (c.ehPallet) {
      let textoIdentificador = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textoIdentificador.setAttribute("x", posX + widthPX / 2);
      textoIdentificador.setAttribute("y", posY + heightPX / 2 - 2);
      textoIdentificador.setAttribute("fill", "#ffffff");
      textoIdentificador.setAttribute("font-size", "9px");
      textoIdentificador.setAttribute("font-weight", "bold");
      textoIdentificador.setAttribute("text-anchor", "middle");
      textoIdentificador.textContent = c.textoTxt;
      svgCima.appendChild(textoIdentificador);

      if (widthPX > 28 && heightPX > 20) {
        let textoMedidaPallet = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        textoMedidaPallet.setAttribute("x", posX + widthPX / 2);
        textoMedidaPallet.setAttribute("y", posY + heightPX / 2 + 8);
        textoMedidaPallet.setAttribute("fill", "rgba(255,255,255,0.85)");
        textoMedidaPallet.setAttribute("font-size", "8px");
        textoMedidaPallet.setAttribute("text-anchor", "middle");
        textoMedidaPallet.textContent = c.dimTexto;
        svgCima.appendChild(textoMedidaPallet);
      }
    } else {
      if (widthPX > 24 && heightPX > 18) {
        let textoMedida = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        let deslocamentoY = c.empilhados > 1 ? -4 : 3;

        textoMedida.setAttribute("x", posX + widthPX / 2);
        textoMedida.setAttribute("y", posY + heightPX / 2 + deslocamentoY);
        textoMedida.setAttribute("fill", "#ffffff");
        textoMedida.setAttribute("font-size", "8.5px");
        textoMedida.setAttribute("font-weight", "normal");
        textoMedida.setAttribute("text-anchor", "middle");
        textoMedida.textContent = c.dimTexto;
        svgCima.appendChild(textoMedida);
      }

if (c.empilhados > 1) {

  let textoQtd = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text",
  );

  textoQtd.setAttribute(
    "x",
    posX + widthPX / 2
  );

  textoQtd.setAttribute(
    "y",
    posY + heightPX / 2 + 7
  );

  textoQtd.setAttribute(
    "fill",
    "#ffffff"
  );

  textoQtd.setAttribute(
    "font-size",
    "9px"
  );

  textoQtd.setAttribute(
    "font-weight",
    "bold"
  );

  textoQtd.setAttribute(
    "text-anchor",
    "middle"
  );

  const idsDaPilha =
    Array.isArray(c.unidades)
      ? new Set(
          c.unidades.map(
            (unidade) => unidade.id
          )
        )
      : new Set();

  const pilhaComposta =
    idsDaPilha.size > 1;

  textoQtd.textContent =
    pilhaComposta
      ? `${c.empilhados} ITENS`
      : `${c.empilhados}x`;

  svgCima.appendChild(textoQtd);
}
    }
  });

  // =====================================================
  // C3 - CENTROS INTERNOS + PAINEL EXTERNO
  // =====================================================

  if (pesoTotalBlocos > 0) {
    // Centro de gravidade da carga em pixels
    const cgPixelX =
      offsetX + centroGravidadeX * escalaGlobalX;

    const cgPixelY =
      offsetY + centroGravidadeY * escalaGlobalY;

    // Centro geométrico do veículo em pixels
    const centroVeiculoPixelX =
      offsetX + (veiculo.compFisico / 2) * escalaGlobalX;

    const centroVeiculoPixelY =
      offsetY + (veiculo.largFisica / 2) * escalaGlobalY;

    const grupoComparacao = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    grupoComparacao.setAttribute(
      "class",
      "comparacao-centro-gravidade"
    );

    // ===================================================
    // LINHA TRACEJADA ENTRE OS DOIS CENTROS
    // ===================================================

    const linhaDeslocamento = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    linhaDeslocamento.setAttribute("x1", centroVeiculoPixelX);
    linhaDeslocamento.setAttribute("y1", centroVeiculoPixelY);
    linhaDeslocamento.setAttribute("x2", cgPixelX);
    linhaDeslocamento.setAttribute("y2", cgPixelY);
    linhaDeslocamento.setAttribute("stroke", "#64748b");
    linhaDeslocamento.setAttribute("stroke-width", "1.5");
    linhaDeslocamento.setAttribute("stroke-dasharray", "4 4");
    linhaDeslocamento.setAttribute("opacity", "0.7");

    grupoComparacao.appendChild(linhaDeslocamento);

    // ===================================================
    // CENTRO DO VEÍCULO - PONTO AZUL DISCRETO
    // ===================================================

    const pontoCentroVeiculo = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    pontoCentroVeiculo.setAttribute("cx", centroVeiculoPixelX);
    pontoCentroVeiculo.setAttribute("cy", centroVeiculoPixelY);
    pontoCentroVeiculo.setAttribute("r", "4");
    pontoCentroVeiculo.setAttribute("fill", "#2563eb");
    pontoCentroVeiculo.setAttribute("stroke", "#ffffff");
    pontoCentroVeiculo.setAttribute("stroke-width", "1.5");

    grupoComparacao.appendChild(pontoCentroVeiculo);

    const tituloCentroVeiculo = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title"
    );

    tituloCentroVeiculo.textContent =
      `Centro geométrico do veículo: ` +
      `X ${(veiculo.compFisico / 2).toFixed(2)} m | ` +
      `Y ${(veiculo.largFisica / 2).toFixed(2)} m`;

    pontoCentroVeiculo.appendChild(tituloCentroVeiculo);

    // ===================================================
    // CG DA CARGA - PONTO VERMELHO DISCRETO
    // ===================================================

    const pontoCG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    pontoCG.setAttribute("cx", cgPixelX);
    pontoCG.setAttribute("cy", cgPixelY);
    pontoCG.setAttribute("r", "4");
    pontoCG.setAttribute("fill", "#dc2626");
    pontoCG.setAttribute("stroke", "#ffffff");
    pontoCG.setAttribute("stroke-width", "1.5");

    grupoComparacao.appendChild(pontoCG);

    const tituloCG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title"
    );

    tituloCG.textContent =
      `Centro de gravidade da carga: ` +
      `X ${centroGravidadeX.toFixed(2)} m | ` +
      `Y ${centroGravidadeY.toFixed(2)} m`;

    pontoCG.appendChild(tituloCG);

    // ===================================================
    // PAINEL ABAIXO DO VEÍCULO
    // ===================================================

    const painelX = offsetX;
    const painelY = offsetY + alturaBauPixels + 22;
    const painelLargura = Math.max(larguraBauPixels, 260);
    const painelAltura = 48;

    const fundoPainel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );

    fundoPainel.setAttribute("x", painelX);
    fundoPainel.setAttribute("y", painelY);
    fundoPainel.setAttribute("width", painelLargura);
    fundoPainel.setAttribute("height", painelAltura);
    fundoPainel.setAttribute("rx", "7");
    fundoPainel.setAttribute("fill", "#f8fafc");
    fundoPainel.setAttribute("stroke", "#cbd5e1");
    fundoPainel.setAttribute("stroke-width", "1");

    grupoComparacao.appendChild(fundoPainel);

    // Linha vertical ligando o CG ao painel
    const linhaGuiaCG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    linhaGuiaCG.setAttribute("x1", cgPixelX);
    linhaGuiaCG.setAttribute("y1", cgPixelY + 6);
    linhaGuiaCG.setAttribute("x2", cgPixelX);
    linhaGuiaCG.setAttribute("y2", painelY);
    linhaGuiaCG.setAttribute("stroke", "#dc2626");
    linhaGuiaCG.setAttribute("stroke-width", "1.5");
    linhaGuiaCG.setAttribute("stroke-dasharray", "3 3");
    linhaGuiaCG.setAttribute("opacity", "0.7");

    grupoComparacao.appendChild(linhaGuiaCG);

    // Legenda do centro do veículo
    const textoCentroVeiculo = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

    textoCentroVeiculo.setAttribute("x", painelX + 12);
    textoCentroVeiculo.setAttribute("y", painelY + 19);
    textoCentroVeiculo.setAttribute("font-size", "10");
    textoCentroVeiculo.setAttribute("font-weight", "700");
    textoCentroVeiculo.setAttribute("fill", "#2563eb");

    textoCentroVeiculo.textContent =
      `● Centro do veículo: X ${(veiculo.compFisico / 2).toFixed(2)} m | ` +
      `Y ${(veiculo.largFisica / 2).toFixed(2)} m`;

    grupoComparacao.appendChild(textoCentroVeiculo);

    // Legenda do centro de gravidade
    const textoCG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

    textoCG.setAttribute("x", painelX + 12);
    textoCG.setAttribute("y", painelY + 37);
    textoCG.setAttribute("font-size", "10");
    textoCG.setAttribute("font-weight", "700");
    textoCG.setAttribute("fill", "#dc2626");

    textoCG.textContent =
      `● CG da carga: X ${centroGravidadeX.toFixed(2)} m | ` +
      `Y ${centroGravidadeY.toFixed(2)} m`;

    grupoComparacao.appendChild(textoCG);

    svgCima.appendChild(grupoComparacao);
  }

  const resumoExcedente = document.getElementById("resumo-excedente");
}

function exportarExcel() {

  const selo = document.getElementById("selo-compatibilidade");
const textoSelo = selo?.textContent.trim() || "";

const cargaAprovada =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("CARGA APROVADA");

const atencaoRegulatoria =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("ATENÇÃO REGULATÓRIA");

const atencaoDistribuicao =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("ATENÇÃO À DISTRIBUIÇÃO DA CARGA");

const distribuicaoCritica =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("DISTRIBUIÇÃO CRÍTICA DA CARGA");

const operacaoNaoCompativel =
  textoSelo.includes("OPERAÇÃO NÃO COMPATÍVEL");

if (distribuicaoCritica) {
  alert(
    "O Excel não pode ser gerado porque a distribuição da carga foi classificada como CRÍTICA. Revise o posicionamento da carga antes de prosseguir.",
  );

  return;
}

if (
  operacaoNaoCompativel ||
  (
    !cargaAprovada &&
    !atencaoRegulatoria &&
    !atencaoDistribuicao
  )
) {
  alert(
    "O Excel não pode ser gerado porque a operação não está compatível.",
  );

  return;
}

let textoStatus = "CARGA APROVADA";
let textoDashboard = "APROVADO";

let corStatus = "DCFCE7";
let corTexto = "166534";

if (atencaoRegulatoria) {
  textoStatus = "ATENÇÃO REGULATÓRIA";
  textoDashboard = "VERIFICAR AET";

  corStatus = "FEF3C7";
  corTexto = "92400E";
}

if (atencaoDistribuicao) {
  textoStatus = "ATENÇÃO À DISTRIBUIÇÃO DA CARGA";
  textoDashboard = "REVISAR DISTRIBUIÇÃO";

  corStatus = "FEF3C7";
  corTexto = "92400E";
}

  try {
    const rows = document.querySelectorAll("#tabela-carga tbody tr");

    const agora = new Date();
    const codigoSimulacao =
      "DCPRO-" +
      agora.getFullYear() +
      String(agora.getMonth() + 1).padStart(2, "0") +
      String(agora.getDate()).padStart(2, "0") +
      "-" +
      String(agora.getHours()).padStart(2, "0") +
      String(agora.getMinutes()).padStart(2, "0") +
      String(agora.getSeconds()).padStart(2, "0");

    let listaCarga = [];
    let pesoTotal = 0;
    let volumeTotal = 0;

    rows.forEach((tr, index) => {
      const nome = tr.querySelector(".nome")?.value || `Item ${index + 1}`;
      const qtd = parseInt(tr.querySelector(".qtd")?.value) || 0;

      const comp =
        (parseFloat(tr.querySelector(".comp")?.value.replace(",", ".")) || 0) /
        100;
      const larg =
        (parseFloat(tr.querySelector(".larg")?.value.replace(",", ".")) || 0) /
        100;
      const alt =
        (parseFloat(tr.querySelector(".alt")?.value.replace(",", ".")) || 0) /
        100;

      const peso =
        Number(
          tr.querySelector(".peso")?.value.replace(/\./g, "").replace(",", "."),
        ) || 0;

      pesoTotal += peso * qtd;
      volumeTotal += comp * larg * alt * qtd;

      listaCarga.push({
        id: index + 1,
        nome,
        qtd,
        comp,
        larg,
        alt,
        peso,
        pesoTotal: peso * qtd,
        volume: comp * larg * alt * qtd,
      });
    });

    const cargas = ultimaFrotaCalculada;

    const wb = XLSX.utils.book_new();

    const azul = "1E3A8A";
    const azulClaro = "EAF2FF";
    const verde = "DCFCE7";
    const branco = "FFFFFF";
    const cinza = "F8FAFC";

    function borda() {
      return {
        top: { style: "thin", color: { rgb: "CBD5E1" } },
        bottom: { style: "thin", color: { rgb: "CBD5E1" } },
        left: { style: "thin", color: { rgb: "CBD5E1" } },
        right: { style: "thin", color: { rgb: "CBD5E1" } },
      };
    }

    function estiloCelula(
      bg,
      cor = "000000",
      bold = false,
      tamanho = 11,
      centro = false,
    ) {
      return {
        font: { bold, sz: tamanho, color: { rgb: cor } },
        fill: { patternType: "solid", fgColor: { rgb: bg } },
        border: borda(),
        alignment: {
          horizontal: centro ? "center" : "left",
          vertical: "center",
          wrapText: true,
        },
      };
    }

    function aplicarEstilo(ws, rangeRef) {
      const range = XLSX.utils.decode_range(rangeRef);

      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[ref]) continue;

          if (R === range.s.r) {
            ws[ref].s = estiloCelula(azul, branco, true, 11, true);
          } else {
            ws[ref].s = estiloCelula(R % 2 === 0 ? cinza : branco);
          }
        }
      }
    }

    // =========================
    // ABA RESUMO
    // =========================
    // =========================
    // ABA RESUMO - DASHBOARD
    // =========================
    const resumo = [
      ["DCPRO - DIMENSIONADOR DE CARGA PRO", "", "", "", ""],
      ["RELATÓRIO OPERACIONAL DE CARGA", "", "", "", ""],
      ["", "", "", "", ""],
      ["Código", codigoSimulacao, "", "Data/Hora", agora.toLocaleString()],
      ["Status", textoStatus, "", "Veículos", cargas.length],
      ["PESO TOTAL", "VOLUME TOTAL", "ITENS", "VEÍCULOS", "STATUS"],
      [
        formatarBR(pesoTotal) + " kg",
        formatarBR(volumeTotal) + " m³",
        listaCarga.length,
        cargas.length,
        textoDashboard,
      ],
      ["", "", "", ""],
      ["FROTA UTILIZADA", "", "", "", ""],
      ["Veículo", "Modelo", "Peso", "Volume", "Ocupação"],
    ];

    cargas.forEach((carga, index) => {
      const v = carga.veiculo;
      const volMax = v.compFisico * v.largFisica * v.altFisica;
      const pctPeso = (carga.pesoAtual / v.pesoMax) * 100;

      resumo.push([
        `Veículo ${index + 1}`,
        v.nome,
        `${formatarBR(carga.pesoAtual)} / ${formatarBR(v.pesoMax)} kg`,
        `${formatarBR(carga.volumeAtual)} / ${formatarBR(volMax)} m³`,
        pctPeso.toFixed(0) + "%",
      ]);
    });

    resumo.push(["", "", "", "", ""]);

    resumo.push(["OBSERVAÇÕES", "", "", "", ""]);

    resumo.push([
      "Relatório gerado automaticamente pelo DCPRO.",
      "",
      "",
      "",
      "",
    ]);

    resumo.push([
      "A projeção apresentada é matemática e serve como apoio operacional. Não substitui conferência técnica presencial, inspeção da carga ou critérios de segurança para transporte.",
      "",
      "",
      "",
      "",
    ]);

    if (atencaoDistribuicao && ressalvaCgAtual) {
  resumo.push(["", "", "", "", ""]);

  resumo.push([
    "C3 / DISTRIBUIÇÃO DA CARGA",
    "",
    "",
    "",
    "",
  ]);

  resumo.push([
    ressalvaCgAtual.titulo,
    "",
    "",
    "",
    "",
  ]);

  resumo.push([
    ressalvaCgAtual.mensagem,
    "",
    "",
    "",
    "",
  ]);
}

    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);

    wsResumo["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Título
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Subtítulo
      { s: { r: 8, c: 0 }, e: { r: 8, c: 4 } }, // Frota utilizada
      {
  s: { r: 11 + cargas.length, c: 0 },
  e: { r: 11 + cargas.length, c: 4 },
}, // Observações

{
  s: { r: 12 + cargas.length, c: 0 },
  e: { r: 12 + cargas.length, c: 4 },
}, // Frase 1

{
  s: { r: 13 + cargas.length, c: 0 },
  e: { r: 13 + cargas.length, c: 4 },
}, // Frase 2
    ];

    if (atencaoDistribuicao && ressalvaCgAtual) {
  wsResumo["!merges"].push(
    {
      s: { r: 15 + cargas.length, c: 0 },
      e: { r: 15 + cargas.length, c: 4 },
    }, // C3 - título

    {
      s: { r: 16 + cargas.length, c: 0 },
      e: { r: 16 + cargas.length, c: 4 },
    }, // C3 - classificação

    {
      s: { r: 17 + cargas.length, c: 0 },
      e: { r: 17 + cargas.length, c: 4 },
    }, // C3 - mensagem
  );
}

    wsResumo["!cols"] = [
      { wch: 26 },
      { wch: 28 },
      { wch: 24 },
      { wch: 28 },
      { wch: 18 },
    ];

    wsResumo["!rows"] = [
      { hpt: 34 }, // Linha 1
      { hpt: 24 }, // Linha 2
      { hpt: 10 }, // Linha 3
      { hpt: 22 }, // Linha 4
      { hpt: 22 }, // Linha 5
      { hpt: 26 }, // Linha 6
      { hpt: 32 }, // Linha 7
      { hpt: 10 }, // Linha 8
      { hpt: 24 }, // Linha 9
      { hpt: 22 }, // Linha 10
      { hpt: 22 }, // Linha 11
      { hpt: 22 }, // Linha 12
      { hpt: 10 }, // Linha 13
      { hpt: 24 }, // Linha 14 - OBSERVAÇÕES
      { hpt: 28 }, // Linha 15 - Frase 1
      { hpt: 52 }, // Linha 16 - Frase 2
    ];

    wsResumo["A1"].s = estiloCelula(azul, branco, true, 18, true);
    wsResumo["A2"].s = estiloCelula(azul, branco, true, 13, true);

    ["A3", "D3", "A4", "D4"].forEach((ref) => {
      if (wsResumo[ref])
        wsResumo[ref].s = estiloCelula(azulClaro, azul, true, 11);
    });

    ["A6", "B6", "C6", "D6", "E6"].forEach((ref) => {
      if (wsResumo[ref])
        wsResumo[ref].s = estiloCelula(azul, branco, true, 12, true);
    });

    ["A7", "B7", "C7", "D7", "E7"].forEach((ref) => {
  if (wsResumo[ref])
    wsResumo[ref].s = estiloCelula(
      corStatus,
      corTexto,
      true,
      15,
      true
    );
});

    wsResumo["A9"].s = estiloCelula(azul, branco, true, 13, true);

    ["A10", "B10", "C10", "D10", "E10"].forEach((ref) => {
      if (wsResumo[ref])
        wsResumo[ref].s = estiloCelula(azul, branco, true, 11, true);
    });

    for (let i = 11; i <= 10 + cargas.length; i++) {
      ["A", "B", "C", "D", "E"].forEach((col) => {
        const ref = col + i;
        if (wsResumo[ref]) {
          wsResumo[ref].s = estiloCelula(
            i % 2 === 0 ? cinza : branco,
            "000000",
            col === "A" || col === "B",
            10,
          );
        }
      });
    }

const linhaObs = 12 + cargas.length;
const linhaObsTexto1 = linhaObs + 1;
const linhaObsTexto2 = linhaObs + 2;

    if (wsResumo["A" + linhaObs]) {
      wsResumo["A" + linhaObs].s = estiloCelula(azul, branco, true, 12, true);
    }

    if (wsResumo["A" + linhaObsTexto1]) {
      wsResumo["A" + linhaObsTexto1].s = estiloCelula(
        branco,
        "000000",
        false,
        10,
      );
      wsResumo["A" + linhaObsTexto1].s.alignment = {
        horizontal: "left",
        vertical: "center",
        wrapText: true,
      };
    }

    if (wsResumo["A" + linhaObsTexto2]) {
      wsResumo["A" + linhaObsTexto2].s = estiloCelula(
        branco,
        "000000",
        false,
        10,
      );
      wsResumo["A" + linhaObsTexto2].s.alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: true,
      };
    }

    // Separadores visuais dinâmicos da aba Resumo

// Linha vazia entre a frota e OBSERVAÇÕES
wsResumo["!rows"][10 + cargas.length] = {
  hpt: 10,
};

// Linha vazia entre OBSERVAÇÕES e o bloco C3
if (atencaoDistribuicao && ressalvaCgAtual) {
  wsResumo["!rows"][14 + cargas.length] = {
    hpt: 10,
  };
}

    // Alturas dinâmicas do bloco de observações
wsResumo["!rows"][linhaObs - 1] = {
  hpt: 24,
};

wsResumo["!rows"][linhaObsTexto1 - 1] = {
  hpt: 28,
};

wsResumo["!rows"][linhaObsTexto2 - 1] = {
  hpt: 52,
};

    if (atencaoDistribuicao && ressalvaCgAtual) {
const linhaC3Titulo = 16 + cargas.length;
const linhaC3Status = 17 + cargas.length;
const linhaC3Mensagem = 18 + cargas.length;

  // Título do bloco C3
  if (wsResumo["A" + linhaC3Titulo]) {
    wsResumo["A" + linhaC3Titulo].s =
      estiloCelula(
        azul,
        branco,
        true,
        12,
        false,
      );

    wsResumo["A" + linhaC3Titulo].s.alignment = {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    };
  }

  // Classificação do C3
  if (wsResumo["A" + linhaC3Status]) {
    wsResumo["A" + linhaC3Status].s =
      estiloCelula(
        "FEF3C7",
        "92400E",
        true,
        11,
        false,
      );

    wsResumo["A" + linhaC3Status].s.alignment = {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    };
  }

  // Mensagem operacional
  if (wsResumo["A" + linhaC3Mensagem]) {
    wsResumo["A" + linhaC3Mensagem].s =
      estiloCelula(
        "FFFBEB",
        "78350F",
        false,
        10,
        false,
      );

    wsResumo["A" + linhaC3Mensagem].s.alignment = {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    };
  }

  // Alturas das novas linhas
  wsResumo["!rows"][linhaC3Titulo - 1] = {
    hpt: 24,
  };

  wsResumo["!rows"][linhaC3Status - 1] = {
    hpt: 26,
  };

  wsResumo["!rows"][linhaC3Mensagem - 1] = {
    hpt: 42,
  };
}

    for (let ref in wsResumo) {
      if (ref[0] !== "!" && !wsResumo[ref].s) {
        wsResumo[ref].s = estiloCelula(branco);
      }
    }

    // =========================
    // ABA ITENS
    // =========================
    const itens = [
      [
        "Item",
        "Identificação",
        "Qtd",
        "Comp (m)",
        "Larg (m)",
        "Alt (m)",
        "Peso Unit. (kg)",
        "Peso Total (kg)",
        "Volume (m³)",
      ],
    ];

    listaCarga.forEach((item) => {
      itens.push([
        item.id,
        item.nome,
        item.qtd,
        item.comp,
        item.larg,
        item.alt,
        item.peso,
        item.pesoTotal,
        item.volume,
      ]);
    });

    const wsItens = XLSX.utils.aoa_to_sheet(itens);
    wsItens["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];
    wsItens["!autofilter"] = { ref: wsItens["!ref"] };
    aplicarEstilo(wsItens, wsItens["!ref"]);

    // =========================
    // ABA VEÍCULOS
    // =========================
    const veiculos = [
      [
        "Veículo",
        "Peso Ocupado",
        "Peso Máximo",
        "% Peso",
        "Volume Ocupado",
        "Volume Máximo",
        "% Volume",
        "Área Ocupada",
        "Área Máxima",
      ],
    ];

    cargas.forEach((carga, index) => {
      const v = carga.veiculo;
      const volMax = v.compFisico * v.largFisica * v.altFisica;
      const areaMax = v.compFisico * v.largFisica;
      const areaOcupada = Math.min(carga.areaAtual || 0, areaMax);

      veiculos.push([
        `Veículo ${index + 1} - ${v.nome}`,
        formatarBR(carga.pesoAtual) + " kg",
        formatarBR(v.pesoMax) + " kg",
        ((carga.pesoAtual / v.pesoMax) * 100).toFixed(0) + "%",
        formatarBR(carga.volumeAtual) + " m³",
        formatarBR(volMax) + " m³",
        ((carga.volumeAtual / volMax) * 100).toFixed(0) + "%",
        formatarBR(areaOcupada) + " m²",
        formatarBR(areaMax) + " m²",
      ]);
    });

    const wsVeiculos = XLSX.utils.aoa_to_sheet(veiculos);
    wsVeiculos["!cols"] = [
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
    ];
    wsVeiculos["!autofilter"] = { ref: wsVeiculos["!ref"] };
    aplicarEstilo(wsVeiculos, wsVeiculos["!ref"]);

    // =========================
    // ABA DISTRIBUIÇÃO
    // =========================
    const distribuicao = [
      [
        "Veículo",
        "Item",
        "Identificação",
        "Qtd",
        "Dimensões",
        "Peso Unit.",
        "Peso Total",
      ],
    ];

    cargas.forEach((carga, index) => {
      carga.itens.forEach((item) => {
        distribuicao.push([
          `Veículo ${index + 1} - ${carga.veiculo.nome}`,
          item.id,
          item.nome,
          item.qtd,
          `${item.comp.toFixed(2)} x ${item.larg.toFixed(2)} x ${item.alt.toFixed(2)} m`,
          formatarBR(item.peso) + " kg",
          formatarBR(item.peso * item.qtd) + " kg",
        ]);
      });
    });

    const wsDistribuicao = XLSX.utils.aoa_to_sheet(distribuicao);
    wsDistribuicao["!cols"] = [
      { wch: 30 },
      { wch: 8 },
      { wch: 25 },
      { wch: 8 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
    ];
    wsDistribuicao["!autofilter"] = { ref: wsDistribuicao["!ref"] };
    aplicarEstilo(wsDistribuicao, wsDistribuicao["!ref"]);

    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
    XLSX.utils.book_append_sheet(wb, wsItens, "Itens da Carga");
    XLSX.utils.book_append_sheet(wb, wsVeiculos, "Frota");
    XLSX.utils.book_append_sheet(wb, wsDistribuicao, "Distribuicao");

    XLSX.writeFile(wb, "Romaneio_" + codigoSimulacao + ".xlsx");
  } catch (e) {
    console.error("Erro:", e);
    alert("Erro na exportação: " + e.message);
  }
}

// =====================================================
// EXPORTAÇÃO DE RELATÓRIOS
// =====================================================

async function gerarRelatorioPDF() {

  const selo = document.getElementById("selo-compatibilidade");
const textoSelo = selo?.textContent.trim() || "";

const cargaAprovada =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("CARGA APROVADA");

const atencaoRegulatoria =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("ATENÇÃO REGULATÓRIA");

const distribuicaoAtencao =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("ATENÇÃO À DISTRIBUIÇÃO DA CARGA");

const distribuicaoCritica =
  selo &&
  selo.style.display !== "none" &&
  textoSelo.includes("DISTRIBUIÇÃO CRÍTICA DA CARGA");

const operacaoNaoCompativel =
  textoSelo.includes("OPERAÇÃO NÃO COMPATÍVEL");

if (distribuicaoCritica) {
  alert(
    "O PDF não pode ser gerado porque a distribuição da carga foi classificada como CRÍTICA. Revise o posicionamento da carga antes de prosseguir.",
  );

  return;
}

if (
  operacaoNaoCompativel ||
  (!cargaAprovada &&
    !atencaoRegulatoria &&
    !distribuicaoAtencao)
) {
  alert(
    "O PDF não pode ser gerado porque a operação não está compatível.",
  );

  return;
}

let statusRelatorio = "STATUS: CARGA APROVADA";
let corStatusRelatorio = [0, 128, 0];

if (atencaoRegulatoria) {
  statusRelatorio =
    "STATUS: ATENÇÃO REGULATÓRIA — VERIFIQUE A NECESSIDADE DE AET";

  corStatusRelatorio = [180, 83, 9];
}

if (distribuicaoAtencao) {
  statusRelatorio =
    "STATUS: ATENÇÃO À DISTRIBUIÇÃO DA CARGA";

  corStatusRelatorio = [180, 83, 9];
}

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const agora = new Date();
  const codigoSimulacao =
    "DCPRO-" +
    agora.getFullYear() +
    String(agora.getMonth() + 1).padStart(2, "0") +
    String(agora.getDate()).padStart(2, "0") +
    "-" +
    String(agora.getHours()).padStart(2, "0") +
    String(agora.getMinutes()).padStart(2, "0") +
    String(agora.getSeconds()).padStart(2, "0");

  const rows = document.querySelectorAll("#tabela-carga tbody tr");

  let listaCarga = [];
  let pesoTotal = 0;
  let volumeTotal = 0;

  rows.forEach((tr, index) => {
    const nome = tr.querySelector(".nome")?.value || `Item ${index + 1}`;
    const qtd = parseInt(tr.querySelector(".qtd")?.value) || 0;

    const comp =
      (parseFloat(tr.querySelector(".comp")?.value.replace(",", ".")) || 0) /
      100;
    const larg =
      (parseFloat(tr.querySelector(".larg")?.value.replace(",", ".")) || 0) /
      100;
    const alt =
      (parseFloat(tr.querySelector(".alt")?.value.replace(",", ".")) || 0) /
      100;

    const peso =
      Number(
        tr.querySelector(".peso")?.value.replace(/\./g, "").replace(",", "."),
      ) || 0;

    pesoTotal += peso * qtd;
    volumeTotal += comp * larg * alt * qtd;

    listaCarga.push({
      id: index + 1,
      nome,
      qtd,
      comp,
      larg,
      alt,
      peso,
      cor: coresItens[index % coresItens.length],
    });
  });

  const cargas = ultimaFrotaCalculada;

  // =========================
  // CAPA / CABEÇALHO
  // =========================
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, "bold");
  doc.text("DIMENSIONADOR DE CARGA PRO", 105, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90);
  doc.text("Relatório Operacional de Carga", 105, 26, { align: "center" });
  doc.text("Data da Simulação: " + agora.toLocaleString(), 105, 34, {
    align: "center",
  });
  doc.text("Código da Simulação: " + codigoSimulacao, 105, 41, {
    align: "center",
  });

  doc.line(20, 48, 190, 48);

  // =========================
  // RESUMO GERAL
  // =========================
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.setFont(undefined, "bold");
  doc.text("Resumo Geral da Carga", 20, 58);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont(undefined, "normal");

  doc.text(`Peso Total: ${formatarBR(pesoTotal)} kg`, 20, 67);
  doc.text(`Volume Total: ${formatarBR(volumeTotal)} m³`, 20, 74);
  doc.text(`Total de Itens: ${listaCarga.length}`, 20, 81);
  doc.text(`Quantidade de Veículos: ${cargas.length}`, 20, 88);

  doc.setFontSize(atencaoRegulatoria ? 11 : 14);
doc.setTextColor(
  corStatusRelatorio[0],
  corStatusRelatorio[1],
  corStatusRelatorio[2],
);
doc.setFont(undefined, "bold");
doc.text(statusRelatorio, 105, 102, { align: "center" });

  doc.line(20, 110, 190, 110);

  // =========================
  // TABELA DE ITENS
  // =========================
  const tableBody = listaCarga.map((item) => [
    item.id,
    item.nome,
    item.qtd,
    `${item.comp.toFixed(2)} x ${item.larg.toFixed(2)} x ${item.alt.toFixed(2)} m`,
    `${formatarBR(item.peso)} kg`,
    `${formatarBR(item.peso * item.qtd)} kg`,
  ]);

  doc.autoTable({
    startY: 118,
    head: [
      ["Item", "Identificação", "Qtd", "Dimensões", "Peso Unit.", "Peso Total"],
    ],
    body: tableBody,
    headStyles: { fillColor: [30, 58, 138] },
    theme: "grid",
    styles: { fontSize: 8 },
  });

  let y = doc.lastAutoTable.finalY + 12;

  // =========================
  // LAYOUT VISUAL DA CARGA
  // =========================
  const blocosVeiculos = document.querySelectorAll(".bloco-veiculo");

  if (blocosVeiculos.length > 0) {
    doc.addPage();

    doc.setFontSize(15);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, "bold");
    doc.text("Layout Visual da Carga", 105, 18, { align: "center" });

    let yLayout = 30;

    for (let i = 0; i < blocosVeiculos.length; i++) {
      const bloco = blocosVeiculos[i];
      const carga = cargas[i];

      if (yLayout > 220) {
        doc.addPage();
        yLayout = 20;
      }

      const alvoImagem = bloco;

      const canvas = await html2canvas(alvoImagem, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yLayout + imgHeight > 275) {
        doc.addPage();
        yLayout = 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, yLayout - 2, 170, imgHeight + 4, 2, 2, "FD");

      doc.addImage(imgData, "PNG", 22, yLayout, 166, imgHeight);

      yLayout += imgHeight + 14;
    }

    y = yLayout;
  }

  // =========================
  // OBSERVAÇÕES
  // =========================
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(70);
  doc.setFont(undefined, "bold");
  doc.text("Observações Técnicas", 20, y);

  doc.setFont(undefined, "normal");
  doc.text(
    "- Relatório gerado automaticamente pelo Dimensionador de Carga Pro.",
    20,
    y + 8,
  );
  doc.text(
    "- A projeção é matemática e não substitui a conferência técnica presencial.",
    20,
    y + 15,
  );
  doc.text(
    "- A acomodação final deve respeitar amarração, distribuição de peso e legislação vigente.",
    20,
    y + 22,
  );

  if (ressalvaCgAtual) {
  doc.setFont(undefined, "bold");

  doc.text(
    `- C3 / Distribuição da carga: ${ressalvaCgAtual.titulo}`,
    20,
    y + 31,
  );

  doc.setFont(undefined, "normal");

  const textoRessalvaCg = doc.splitTextToSize(
    ressalvaCgAtual.mensagem,
    165,
  );

  doc.text(
    textoRessalvaCg,
    20,
    y + 38,
  );
}

  // =========================
  // ASSINATURAS
  // =========================
  y += ressalvaCgAtual ? 65 : 45;

  if (y > 260) {
    doc.addPage();
    y = 220;
  }

  doc.line(20, y, 90, y);
  doc.text("Assinatura do Motorista", 20, y + 6);

  doc.line(120, y, 190, y);
  doc.text("Assinatura do Conferente", 120, y + 6);

  // RODAPÉ
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("DCPRO - Relatório gerado automaticamente.", 105, 285, {
    align: "center",
  });

  doc.save("Relatorio_" + codigoSimulacao + ".pdf");
}

function limparTudo() {
  localStorage.removeItem("dcpro_carga");

  const tbody = document.querySelector("#tabela-carga tbody");
  tbody.innerHTML = "";

  document.getElementById("bloco-resultados").style.display = "none";
  document.getElementById("bloco-mapa").style.display = "none";
  document.getElementById("alerta-frota").style.display = "none";
  document.getElementById("sugestao-frota").style.display = "none";

  const alertaAET = document.getElementById("alerta-aet");

if (alertaAET) {
  alertaAET.style.display = "none";
  alertaAET.innerHTML = "";
}

  document.getElementById("selo-compatibilidade").style.display = "none";
  document.getElementById("btn-gerar-pdf").style.display = "none";
  document.getElementById("btn-excel").style.display = "none";

  document.getElementById("container-veiculos").innerHTML = "";
  document.getElementById("bar-peso").style.width = "0%";
  document.getElementById("bar-peso").innerText = "0%";
  document.getElementById("txt-vol").innerText = "0";
  document.getElementById("max-vol").innerText = "0";
  document.getElementById("bar-vol").style.width = "0%";
  document.getElementById("bar-vol").innerText = "0%";

  // Não é mais necessário.
  // Cada veículo cria sua própria faixa de dimensões.
  globalEstorouMetragem = false;
  ultimaFrotaCalculada = [];

// Limpar veículo personalizado
document.getElementById("vp-nome").value = "";
document.getElementById("vp-peso").value = "";
document.getElementById("vp-comp").value = "";
document.getElementById("vp-larg").value = "";
document.getElementById("vp-alt").value = "";
document.getElementById("vp-qtd").value = 1;

// Limpa também o LocalStorage
localStorage.removeItem("dcpro_veiculo_personalizado");

  adicionarLinha(false);
  const aviso = document.getElementById("avisoItensIncompletos");
  if (aviso) aviso.style.display = "none";
}

// =====================================================
// LOCAL STORAGE
// =====================================================

function salvarCarga() {
  const itens = [];

  document.querySelectorAll("#tabela-carga tbody tr").forEach((linha) => {
    itens.push({
      nome: linha.querySelector(".nome")?.value || "",
      qtd: linha.querySelector(".qtd")?.value || "",
      comp: linha.querySelector(".comp")?.value || "",
      larg: linha.querySelector(".larg")?.value || "",
      alt: linha.querySelector(".alt")?.value || "",
      peso: linha.querySelector(".peso")?.value || "",
    });
  });

  localStorage.setItem("dcpro_carga", JSON.stringify(itens));
}

function carregarCargaSalva() {
  const dados = localStorage.getItem("dcpro_carga");

  const tbody = document.querySelector("#tabela-carga tbody");
  tbody.innerHTML = "";

  if (!dados) {
    adicionarLinha(false);
    return;
  }

  const itens = JSON.parse(dados);

  if (!Array.isArray(itens) || itens.length === 0) {
    adicionarLinha(false);
    return;
  }

  itens.forEach((item) => {
    adicionarLinha(false);

    const linha = document.querySelector("#tabela-carga tbody tr:last-child");

    linha.querySelector(".nome").value = item.nome || "";
    linha.querySelector(".qtd").value = item.qtd || "1";
    linha.querySelector(".comp").value = item.comp || "";
    linha.querySelector(".larg").value = item.larg || "";
    linha.querySelector(".alt").value = item.alt || "";
    linha.querySelector(".peso").value = item.peso || "";
  });

  atualizarLabelsEcores();
}

function verificarVeiculoPersonalizado() {
  const select = document.getElementById("select-veiculo");
  const bloco = document.getElementById("bloco-veiculo-personalizado");

  if (!select || !bloco) return;

  if (select.value === "personalizado") {
    bloco.style.display = "block";
  } else {
    bloco.style.display = "none";
  }
}

function salvarVeiculoPersonalizado() {
  const dados = {
    select: document.getElementById("select-veiculo").value,
    nome: document.getElementById("vp-nome")?.value || "",
    peso: document.getElementById("vp-peso")?.value || "",
qtd: document.getElementById("vp-qtd")?.value || "1",
comp: document.getElementById("vp-comp")?.value || "",
    larg: document.getElementById("vp-larg")?.value || "",
    alt: document.getElementById("vp-alt")?.value || "",
  };

  localStorage.setItem("dcpro_veiculo_personalizado", JSON.stringify(dados));
}

function carregarVeiculoPersonalizado() {
  const salvo = localStorage.getItem("dcpro_veiculo_personalizado");
  if (!salvo) return;

  const dados = JSON.parse(salvo);

  document.getElementById("select-veiculo").value = dados.select || "4";
  document.getElementById("vp-nome").value = dados.nome || "";
  document.getElementById("vp-peso").value = dados.peso || "";
  document.getElementById("vp-qtd").value = dados.qtd || "1";
  document.getElementById("vp-comp").value = dados.comp || "";
  document.getElementById("vp-larg").value = dados.larg || "";
  document.getElementById("vp-alt").value = dados.alt || "";

  verificarVeiculoPersonalizado();
}

// =====================================================
// INICIALIZAÇÃO DO SISTEMA
// =====================================================

window.onload = function () {
  document.getElementById("btn-gerar-pdf").style.display = "none";
  document.getElementById("btn-excel").style.display = "none";

  carregarCargaSalva();
  carregarVeiculoPersonalizado();

  if (document.querySelectorAll("#tabela-carga tbody tr").length === 0) {
    adicionarLinha();
  }

  document
    .getElementById("select-veiculo")
    .addEventListener("change", function () {
      verificarVeiculoPersonalizado();
      salvarVeiculoPersonalizado();
    });

  ["vp-nome", "vp-peso", "vp-comp", "vp-larg", "vp-alt"].forEach((id) => {
    document
      .getElementById(id)
      ?.addEventListener("input", salvarVeiculoPersonalizado);
  });

  verificarVeiculoPersonalizado();
};
