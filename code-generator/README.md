# Gerador de Dados de Jogos (Gemini)

## Descrição

Cria e expande automaticamente uma base de dados de jogos em formato JSON. A cada execução, o script adiciona 25 novas entradas únicas sobre jogos de videogame, utilizando a API Gemini para gerar conteúdo estruturado. O resultado é validado e mesclado com o arquivo local `data.json`.

## O que ele faz

- Gera exatamente 25 novas entradas de jogos em formato JSON.
- Evita repetir nomes de jogos que já existem na base de dados.
- Valida a resposta da API para garantir que ela seja um ARRAY com 25 objetos.
- Realiza até 5 tentativas com tempo de espera exponencial em caso de falhas na API.
- Atualiza (sobrescreve) o arquivo `data.json` com a base de dados combinada.

## Pré-requisitos

- Node.js instalado (v18+ recomendado).
- Chave da Gemini API.

## Como executar

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Crie um arquivo `.env` na raiz do projeto com sua chave da API:
    ```
    GEMINI_API_KEY="SUA_CHAVE_AQUI"
    ```
3.  Execute o script:
    ```bash
    npm start
    ```

## O que esperar

- Ao finalizar, o arquivo `data.json` será atualizado com as entradas antigas + 25 novas geradas.
- Logs no console informarão o progresso, o sucesso da operação e possíveis erros.

## Onde ajustar o comportamento

- **Quantidade de itens:** Edite a constante `TOTAL_ITEMS` no arquivo `generator.js`.
- **Função de geração:** A lógica principal está na função `generateNewData` em `generator.js`.
- **Fluxo principal:** A orquestração do processo está na função `main` em `generator.js`.

## Arquivos principais

- `generator.js` — Script principal que chama a API e atualiza a base de dados.
- `data.json` — Arquivo de dados que será gerado e atualizado.
- `package.json` — Configuração do projeto e dependências.
- `.env` — Arquivo para armazenar suas variáveis de ambiente (como a chave da API).

## Avisos

- O arquivo `data.json` será **sobrescrito** ao final de cada execução bem-sucedida.
- Verifique os limites de uso e os custos associados à sua chave da API Gemini antes de executar o script múltiplas vezes.