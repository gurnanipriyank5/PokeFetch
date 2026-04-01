document.addEventListener('DOMContentLoaded', () => {
  const pokemonContainer = document.getElementById('pokemon-container');
  const loadingElement = document.getElementById('loading');
  const paginationControls = document.getElementById('pagination-controls');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInfo = document.getElementById('page-info');
  

  let offset = 0;
  const limit = 40; 


  const fetchPokemon = async () => {
    try {

      loadingElement.classList.remove('hidden');
      pokemonContainer.classList.add('hidden');
      paginationControls.classList.add('hidden');


      const API_URL = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
      
      const response = await fetch(API_URL);
      

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const pokemonList = data.results;


      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(data.count / limit);
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      

      prevBtn.disabled = offset === 0;
      nextBtn.disabled = currentPage === totalPages;


      const detailedPokemonPromises = pokemonList.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        if (!res.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
        return res.json();
      });

      const detailedPokemonData = await Promise.all(detailedPokemonPromises);


      displayPokemon(detailedPokemonData);
      
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      loadingElement.innerHTML = `
        <p style="color: red; font-weight: bold;">
          Failed to load Pokémon. Please check your internet connection or try again later.
        </p>
      `;
    }
  };


  const displayPokemon = (pokemonArray) => {

    pokemonContainer.innerHTML = '';
    
    pokemonArray.forEach(pokemon => {
      const card = document.createElement('div');
      card.classList.add('pokemon-card');

      const image = document.createElement('img');
      image.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
      image.alt = `Image of ${pokemon.name}`;
      
      const name = document.createElement('h2');
      name.textContent = pokemon.name;
      
      const typeContainer = document.createElement('div');
      typeContainer.classList.add('pokemon-type');
      typeContainer.textContent = pokemon.types[0]?.type?.name || 'Unknown';

      card.appendChild(image);
      card.appendChild(name);
      card.appendChild(typeContainer);

      pokemonContainer.appendChild(card);
    });


    loadingElement.classList.add('hidden');
    pokemonContainer.classList.remove('hidden');
    paginationControls.classList.remove('hidden');
  };


  prevBtn.addEventListener('click', () => {
    if (offset >= limit) {
      offset -= limit;
      fetchPokemon();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextBtn.addEventListener('click', () => {
    offset += limit;
    fetchPokemon();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  fetchPokemon();
});
