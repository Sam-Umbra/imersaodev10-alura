import * as fs from "fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const DATA = "data.json";
const TOTAL_ITEMS = 25;

const responseSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      name: {
        type: "STRING",
        description: "Nome oficial do jogo.",
      },
      studio: {
        type: "STRING",
        description: "Estúdio de desenvolvimento do jogo.",
      },
      genres: {
        type: "ARRAY",
        items: {
          type: "STRING",
        },
        description: "Lista de gêneros aos quais o jogo pertence.",
      },
      release_date: {
        type: "STRING",
        description: "Data de lançamento do jogo no formato AAAA-MM-DD.",
      },
      image: {
        type: "STRING",
        description: "URL para uma imagem de capa ou arte promocional do jogo.",
      },
      description: {
        type: "STRING",
        description: "Uma breve descrição ou sinopse do jogo.",
      },
      site: {
        type: "STRING",
        description: "URL para o site oficial do jogo.",
      },
    },
    required: ["name", "studio", "genres", "release_date", "image", "description", "site"],
  },
};

/**
 * Aguarda um determinado número de milissegundos.
 * @param {number} ms - O tempo a esperar em milissegundos.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gera novos dados de jogos usando a API do Gemini.
 * @returns {Promise<Array<Object>>}
 * @param {Array} existingData
 */
async function generateNewData(existingData) {
    const existingNames = existingData.map((item) => item.name).join(', ');

    const systemPrompt = `Você é um especialista em jogos de videogame. Sua tarefa é criar ${TOTAL_ITEMS} novas entradas sobre diferentes jogos com a mesma estrutura JSON. Garanta que cada entrada seja única e relevante. O foco é em jogos novos e populares.`;

    const userQuery = `Gere uma lista de ${TOTAL_ITEMS} jogos de videogame. Siga estritamente a estrutura JSON e o requisito de ser um ARRAY com exatamente ${TOTAL_ITEMS} objetos. NÃO use NENHUM dos seguintes nomes: ${existingNames}.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    let response;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            console.log(`Tentativa ${retries + 1} de ${maxRetries}...`);
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    const newData = JSON.parse(jsonText);
                    if (Array.isArray(newData) && newData.length === TOTAL_ITEMS) {
                        console.log(`Sucesso! ${TOTAL_ITEMS} novos itens gerados pela API.`);
                        return newData;
                    } else {
                        throw new Error(`O array retornado não contém ${TOTAL_ITEMS} itens. Encontrados: ${Array.isArray(newData) ? newData.length : 0}`);
                    }
                } else {
                    throw new Error("Resposta da API vazia ou sem conteúdo textual.");
                }
            } else {
                throw new Error(`Falha na API com status ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            retries++;
            console.warn(`Erro na tentativa ${retries}: ${error.message}`);
            if (retries < maxRetries) {
                const waitTime = Math.pow(2, retries) * 1000;
                console.log(`Aguardando ${waitTime / 1000}s para tentar novamente.`);
                await delay(waitTime);
            } else {
                throw new Error(`Falha ao gerar dados após ${maxRetries} tentativas.`);
            }
        }
    }
}

async function main() {
    if (!apiKey) {
        console.error("\n❌ ERRO: A variável de ambiente GEMINI_API_KEY não está definida.");
        return;
    }

    try {
        let existingData = [];
        try {
            const data = await fs.readFile(DATA, 'utf-8');
            existingData = JSON.parse(data);
            console.log(`Base de dados inicial carregada. Total de itens: ${existingData.length}`);
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.log(`O arquivo ${DATA} não foi encontrado. Iniciando com uma base vazia.`);
            } else {
                throw new Error(`Erro ao ler/analisar ${DATA}: ${e.message}`);
            }
        }

        const newData = await generateNewData(existingData);
        const totalData = [...existingData, ...newData];

        await fs.writeFile(DATA, JSON.stringify(totalData, null, 2), 'utf-8');
        console.log(`\n🎉 SUCESSO! O arquivo '${DATA}' foi atualizado com ${totalData.length} itens.`);

    } catch (error) {
        console.error("\n❌ ERRO FATAL:", error.message);
    }
}

main();