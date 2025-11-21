let data = [];

const cardContainer = document.querySelector(".card-container");
const searchInput = document.getElementById("search-bar");
const searchButton = document.getElementById("botao-busca");
const genreFilter = document.getElementById("genre-filter");
const themeToggleButton = document.getElementById("theme-toggle-button");

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    // Salva a preferência do tema no localStorage
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggleButton.textContent = 'Modo Escuro';
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggleButton.textContent = 'Modo Claro';
    }
});

searchInput.addEventListener("input", startSearch);
searchButton.addEventListener("click", startSearch);
genreFilter.addEventListener("change", startSearch);

// Verifica a preferência de tema salva ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleButton.textContent = 'Modo Escuro';
    } else {
        themeToggleButton.textContent = 'Modo Claro';
    }
});

async function startSearch() {
    try {
        if (data.length === 0) {
            const response = await fetch("data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            populateGenreFilter();
        }
    } catch (error) {
        console.error("Falha ao carregar os dados dos jogos:", error);
        cardContainer.innerHTML = `<p class="error-message">Não foi possível carregar os jogos. Tente novamente mais tarde.</p>`;
        return; // Interrompe a execução se os dados não puderem ser carregados
    }

    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;

    const filteredData = data.filter(game => {
        const nameMatch = game.name.toLowerCase().includes(searchTerm);
        const genreMatch = selectedGenre === 'all' || game.genres.includes(selectedGenre);
        return nameMatch && genreMatch;
    });

    renderCards(filteredData);
}

function populateGenreFilter() {
    const allGenres = new Set();
    data.forEach(game => {
        game.genres.forEach(genre => allGenres.add(genre));
    });

    genreFilter.innerHTML = '<option value="all">Todos os Gêneros</option>';
    const sortedGenres = Array.from(allGenres).sort();
    sortedGenres.forEach(genre => {
        genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
    });
}

function renderCards(data) {
    cardContainer.innerHTML = '';
    data.forEach(e => {
        const article = document.createElement("article");
        article.classList.add("card");

        article.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${e.image}" alt="${e.name} Card Image">
                    <div class="card-content">
                        <div class="card-main">
                            <h2>${e.name}</h2>
                            <p>${e.studio}</p>
                        </div>
                        <div class="card-footer">
                            <ul>
                                ${e.genres.map(genre => `<li>${genre}</li>`).join('')}
                            </ul>
                            <a href="${e.site}" target="_blank">Saiba Mais</a>
                        </div>
                    </div>
                </div>
                <div class="card-back" style="background-image: url('${e.image}')">
                    <div class="card-back-content">
                        <p class="card-back-description">${e.description || 'Sem descrição disponível.'}</p>
                        <p><strong>Lançamento:</strong> ${new Date(e.release_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    </div>
                </div>
            </div>
        `;
        article.addEventListener('click', () => article.classList.toggle('is-flipped'));
        cardContainer.appendChild(article);
    });
}

startSearch();