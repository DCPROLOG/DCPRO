# CHANGELOG

Todas as alterações importantes do projeto **Dimensionador de Carga Pro (DCPRO)** serão documentadas neste arquivo.

---

# DCPRO V1.2 BETA

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

## Histórico de versões

| Versão | Data | Status |
|--------|------|--------|
| V1.2 BETA | 04/07/2026 | Em desenvolvimento |

---

Última atualização: **04/07/2026**

---

Projeto:
Dimensionador de Carga Pro (DCPRO)

Desenvolvimento:
Equipe DCPRO