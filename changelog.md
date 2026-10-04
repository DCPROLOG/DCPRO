# CHANGELOG

Todas as alterações importantes do projeto **Dimensionador de Carga Pro (DCPRO)** serão documentadas neste arquivo.

---

# DCPRO V1.6 BETA

**Status:** Em desenvolvimento

**Data de início:** Julho/2026

------------------------------------------------------------------------

# Revisão Técnica e Refatoração — Setembro/2026

**Data:** 06/09/2026\
**Status:** Concluído (pendente apenas confirmação final de mobile em dispositivo real)

## Added

-   Adicionado botão de duplicar item na tabela de carga, copiando os
    valores da linha original para uma nova linha logo abaixo.
-   Implementado histórico de cálculos recentes (últimos 10), com
    data/hora e veículo utilizado, acessível por um botão dedicado.
-   Implementada validação visual por campo: campos individuais
    inválidos agora recebem destaque (borda vermelha), além do aviso
    geral já existente.
-   Adicionada rolagem vertical na tabela de itens após 8 linhas
    visíveis, com cabeçalho fixo, evitando crescimento indefinido da
    página.
-   Implementado modo de exibição em cartão para a tabela de itens em
    telas de celular, evitando dependência de rolagem horizontal.

## Changed

-   Refatorada por completo a função de renderização do encaixe físico
    (`renderizarArrumacaoLogica`), reduzida de mais de 2.100 linhas
    para cerca de 150, com a lógica dividida em 10 funções
    especializadas e testáveis (montagem de caixas, classificação de
    peso, encaixe físico, ajuste de centro de gravidade, análises
    transversal/longitudinal e renderização visual).
-   Otimizada a renderização da legenda de itens, eliminando
    reprocessamento desnecessário do DOM a cada item.
-   Renomeada `planejarFrotaAntiga` para `planejarFrotaFracionada`,
    refletindo seu papel real no fluxo atual (fallback de
    fracionamento, não código legado).

## Fixed

-   **Corrigido bug crítico de fragmentação de frota**: a checagem de
    "excesso lateral" em `encontrarVeiculoComArrumacao` liberava
    veículos incompatíveis sempre que nenhum item excedia
    comprimento/altura isoladamente, mesmo quando o motivo real de não
    caber era falta de espaço agregado. Isso causava divisão da carga
    em veículos menores do que o necessário.
-   Corrigida inconsistência de parsing entre os campos de dimensão
    (comprimento/largura/altura) e o campo de peso: os primeiros não
    removiam o ponto como separador de milhar, causando cálculo
    incorreto para valores digitados como, por exemplo, "1.350".
-   Concluída a implementação do balanceamento lateral preditivo para
    cargas leves, que estava calculada mas nunca aplicada à pontuação
    de posicionamento.
-   Corrigida checagem de peso/volume em
    `dividirItensQueExcedemMaiorVeiculo`, que validava apenas encaixe
    físico na guarda inicial.
-   Removido código morto: `cargaCabeNoVeiculo`,
    `expandirItensPorQuantidade`, `agruparItensPorId`,
    `distribuirCargaEmVeiculos`, `obterLimiteOperacionalPeso`,
    `estaDentroMargemOperacionalPeso`, `estimarComprimentoLinear`.
-   Removido bloco de busca de veículo alternativo por margem
    operacional em `planejarFrota`, que calculava um resultado nunca
    aplicado.
-   Removidos todos os `console.log` de depuração do fluxo de cálculo
    principal.

------------------------------------------------------------------------

## Sprint 1 — Correções Estruturais

### HTML
- Revisão da estrutura do projeto.
- Correção de elementos duplicados.
- Organização inicial do layout.

### JavaScript
- Correção completa do LocalStorage.
- Correção do carregamento automático.
- Correção do salvamento automático.
- Revisão do cálculo automático.
- Correção do botão "Adicionar Item".
- Correção do botão "Limpar Tudo".
- Revisão do window.onload.
- Remoção de funções duplicadas.
- Revisão da função calcularCarga().
- Limpeza geral do código JavaScript.

### Sistema
- Persistência automática da carga.
- Recuperação automática da última simulação.
- Limpeza correta dos dados ao reiniciar.

---

## Sprint 2 — Planejamento Inteligente de Carga

### Novo algoritmo
- Implementação do planejamento para múltiplos veículos.
- Separação automática da carga por viagens.
- Seleção automática dos veículos necessários.

### Layout Visual
- Novo sistema SVG.
- Um mapa independente para cada veículo.
- Legenda automática.
- Informações individuais de peso.
- Informações individuais de volume.
- Informações individuais de área ocupada.

### PDF
- Novo relatório operacional.
- Página exclusiva para layout da carga.
- Página de observações técnicas.

### Excel
- Novo romaneio operacional.
- Abas separadas por categoria.
- Melhor organização das informações.

---

## Sprint 3 — Refatoração e Padronização

### HTML
- Redução significativa de estilos inline.
- Organização estrutural.
- Componentização de elementos.

### CSS
- Criação do Design System.
- Variáveis CSS (:root).
- Padronização das cores.
- Padronização dos componentes.
- Organização por módulos.
- Melhoria da legibilidade.

### JavaScript
- Organização por módulos.
- Padronização dos comentários.
- Remoção de código morto.
- Eliminação de variáveis sem utilização.
- Revisão das funções.
- Validação da ausência de funções duplicadas.

### Projeto
- Estrutura mais organizada.
- Código mais legível.
- Melhor facilidade de manutenção.
- Base preparada para evolução da V2.0.

---

# Próxima Versão

## Sprint 4 — Inteligência Operacional

**Status:** Concluído

Planejado:

- Melhorias no algoritmo de distribuição.
- Otimização da ocupação física da carga.
- Regras adicionais de compatibilidade.
- Melhorias no planejamento automático da frota.
- Evolução da lógica operacional.

### Added
- Implementada margem operacional de segurança na seleção automática de veículos.
- O algoritmo passou a considerar critérios operacionais além da capacidade física, reduzindo o risco de incompatibilidade durante o carregamento.
- Atualizada a mensagem de ajuste automático de veículo para informar que a recomendação considera dimensões, peso e margem operacional de segurança.

---

## Sprint 5 — Testes, Correções Críticas e Edição Manual de Carga

**Data:** Outubro/2026\
**Status:** Concluído

### Added
- Criada suíte de testes automatizados (`testes.html`), cobrindo as funções centrais de cálculo (`escolherVeiculoIdeal`, `calcularAreaPisoEstimada`, `testarArrumacaoFisica`, `verificarVeiculoMenorDisponivel`, `planejarFrota`, `montarCaixasIndividuais`), com casos de regressão para os bugs corrigidos abaixo e um teste de carga com 150-180 itens variados.
- Implementada sugestão de veículo menor disponível: quando a carga cabe inteiramente no veículo selecionado pelo usuário, o sistema verifica se um veículo padrão menor também atenderia e exibe a sugestão com um botão de troca — sem forçar a troca automática, respeitando a escolha original do usuário.
- Implementada rotação automática de itens no encaixe físico (`testarArrumacaoFisica`, distribuição por peso e encaixe de reserva): quando um item não cabe na orientação original, o sistema testa a orientação girada em 90° antes de recomendar um veículo maior, melhorando o aproveitamento de espaço em cargas com itens compridos e estreitos.
- Criada a aba **Personalizado** como editor manual interativo do mapa de carga:
  - Arrastar caixas (reposicionar dentro do veículo).
  - Girar caixas manualmente (clique no botão da caixa ou duplo clique), com validação automática de colisão e limite do veículo.
  - **Área de Espera**: zona para retirar temporariamente uma caixa do veículo (útil quando não há espaço livre para girá-la no lugar), reorganizada automaticamente em grade.
  - Avaliação ao vivo do arranjo manual (aprovado / atenção / crítico / incompleto), recalculando o centro de gravidade real das caixas posicionadas no veículo a cada movimento, com mensagens equivalentes às do cálculo automático.
  - Persistência do arranjo manual entre recálculos: o sistema guarda a última edição e a restaura automaticamente enquanto a carga (itens + veículo selecionado) não for alterada; qualquer mudança na tabela invalida o arranjo salvo e volta ao posicionamento automático.
  - Aviso fixo no painel informando que o resumo de peso/volume e o selo de status do topo da página refletem o cálculo automático, não o arranjo manual.
- Adicionada aba **Personalizado** à exportação em Excel (apenas quando o veículo correspondente está nesse modo no momento da exportação), listando posição X/Y, dimensões utilizadas, orientação (girada ou não) e peso de cada caixa, além da avaliação do veículo.

### Changed
- PDF e Excel passaram a considerar a avaliação ao vivo do modo Personalizado (quando ativo) para decidir o status do relatório, combinando o pior caso entre o cálculo automático e o(s) veículo(s) em modo manual.
- Reduzido o tamanho dos relatórios em PDF: a captura do layout de carga passou de PNG sem compressão em escala 3 para JPEG comprimido em escala 2 (redução de ~50MB para menos de 500KB por relatório, sem perda perceptível de qualidade).

### Fixed
- **Corrigido bug crítico de margem de segurança no empilhamento**: a tolerância de altura usada para decidir se uma pilha de itens cabe no veículo estava em 1cm (herdada de um ajuste pensado apenas para erro de arredondamento de ponto flutuante), permitindo que pilhas com até 1cm de sobra real fossem aprovadas. Reduzida para 1mm nas três funções que replicam essa lógica (`calcularAreaPisoEstimada`, `testarArrumacaoFisica`, `montarCaixasIndividuais`).
- **Corrigido bug crítico de limite de pilha não verificado**: em `montarCaixasIndividuais` — a função que gera o mapa visual exibido ao usuário —, a comparação `pilha.unidades.length < limiteQuantidade` estava sem o operador `<`, fazendo com que o limite de 2-3 unidades por pilha nunca fosse checado nessa função (apenas a altura). O mapa visual podia assim exibir pilhas com mais unidades do que a regra de segurança do próprio sistema permite.
- Corrigido bloqueio de exportação (PDF e Excel): passam a ser recusados quando algum veículo em modo Personalizado está com avaliação crítica (distribuição de peso) ou possui caixas não posicionadas na Área de Espera, evitando um relatório "aprovado" que não reflete o arranjo manual real.

---

## Histórico de versões

| Versão | Data | Status |
|--------|------|--------|
| V1.6 BETA | 04/10/2026 | Em desenvolvimento |

---

Última atualização: **04/10/2026**

---

Projeto:
Dimensionador de Carga Pro (DCPRO)

Desenvolvimento:
Equipe DCPRO