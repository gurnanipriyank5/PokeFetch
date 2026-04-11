document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pokemon-container');
  const loader = document.getElementById('loading');
  const pages = document.getElementById('pagination-controls');
  const prev = document.getElementById('prev-btn');
  const next = document.getElementById('next-btn');
  const pageText = document.getElementById('page-info');
  
  const searchBar = document.getElementById('search-input');
  const sortBox = document.getElementById('sort-select');
  const darkBtn = document.getElementById('theme-toggle');

  let allPokemon = [];
  let currentList = [];
  let currentIndex = 0;
  const itemsPerPage = 40;


  const fetchAllPokemon = async () => {
    try {
      loader.classList.remove('hidden');
      container.classList.add('hidden');
      pages.classList.add('hidden');

      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const data = await response.json();
      
      allPokemon = data.results;
      currentList = [...allPokemon];
      
      showCurrentPage();
    } catch (err) {
      console.log('Error fetching:', err);
      loader.innerHTML = '<p>Something went wrong!</p>';
    }
  };

  const showCurrentPage = async () => {
    try {
      loader.classList.remove('hidden');
      container.classList.add('hidden');
      pages.classList.add('hidden');

      const pageItems = currentList.slice(currentIndex, currentIndex + itemsPerPage);

      const promises = pageItems.map(async (poke) => {
        const res = await fetch(poke.url);
        return res.json();
      });

      const details = await Promise.all(promises);

      drawPokemonCards(details);


      let pageNum = Math.floor(currentIndex / itemsPerPage) + 1;
      let total = Math.ceil(currentList.length / itemsPerPage);
      if (total === 0) total = 1;
      
      pageText.textContent = `Page ${pageNum} of ${total}`;

      if (currentIndex === 0) {
        prev.disabled = true;
      } else {
        prev.disabled = false;
      }

      if (pageNum === total || currentList.length === 0) {
        next.disabled = true;
      } else {
        next.disabled = false;
      }

    } catch (err) {
       console.log('Error getting details:', err);
    }
  };

  const drawPokemonCards = (pokeList) => {
    container.innerHTML = '';
    
    if (pokeList.length === 0) {
      container.innerHTML = '<p style="text-align: center; width: 100%;">No Pokemon found...</p>';
    }

    pokeList.forEach(poke => {
      const card = document.createElement('div');
      card.classList.add('pokemon-card');

      const img = document.createElement('img');

      if (poke.sprites.other && poke.sprites.other['official-artwork'] && poke.sprites.other['official-artwork'].front_default) {
        img.src = poke.sprites.other['official-artwork'].front_default;
      } else {
        img.src = poke.sprites.front_default;
      }
      img.alt = poke.name;
      
      const nameTag = document.createElement('h2');
      nameTag.textContent = poke.name;
      
      const typeTag = document.createElement('div');
      typeTag.classList.add('pokemon-type');
      if (poke.types && poke.types.length > 0) {
        typeTag.textContent = poke.types[0].type.name;
      } else {
        typeTag.textContent = 'unknown';
      }

      card.appendChild(img);
      card.appendChild(nameTag);
      card.appendChild(typeTag);

      container.appendChild(card);
    });

    loader.classList.add('hidden');
    container.classList.remove('hidden');
    pages.classList.remove('hidden');
  };

  const handleSearchAndSort = () => {
    let text = searchBar.value.toLowerCase();
    

    let results = allPokemon;
    if (text !== '') {
      results = results.filter(p => p.name.toLowerCase().includes(text));
    }


    let sortChoice = sortBox.value;
    if (sortChoice === 'a-z') {
      results.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    } else if (sortChoice === 'z-a') {
      results.sort((a, b) => {
        if (a.name > b.name) return -1;
        if (a.name < b.name) return 1;
        return 0;
      });
    }

    currentList = results;
    currentIndex = 0;
    showCurrentPage();
  };

  searchBar.addEventListener('input', handleSearchAndSort);
  sortBox.addEventListener('change', handleSearchAndSort);

  darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      darkBtn.textContent = '☀️ Light Mode';
    } else {
      darkBtn.textContent = '🌙 Dark Mode';
    }
  });

  prev.addEventListener('click', () => {
    if (currentIndex >= itemsPerPage) {
      currentIndex -= itemsPerPage;
      showCurrentPage();
      window.scrollTo(0, 0);
    }
  });

  next.addEventListener('click', () => {
    if (currentIndex + itemsPerPage < currentList.length) {
      currentIndex += itemsPerPage;
      showCurrentPage();
      window.scrollTo(0, 0);
    }
  });

  fetchAllPokemon();
});
