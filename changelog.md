# CHANGELOG

Todas as alterações importantes do projeto **Dimensionador de Carga Pro (DCPRO)** serão documentadas neste arquivo.

---

# DCPRO V1.2 BETA

**Status:** Em desenvolvimento

**Data de início:** Julho/2026

---

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