const API_KEY = '38558428-cb3057c82e30c898989dfbccf';
const ITEMS_PER_PAGE = 40;
const SCROLL_THRESHOLD = 200;

const gallery = document.querySelector('.gallery');
// const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
let currentSearchQuery = '';
let loading = false;

// loadMoreButton.style.display = 'none';

// SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
});


document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  currentPage = 1;
  gallery.innerHTML = '';
  // loadMoreButton.style.display = 'none';

  const searchQuery = event.target.searchQuery.value.trim();

  if (!searchQuery) return;

  currentSearchQuery = searchQuery;
  await fetchImages(searchQuery, currentPage);
});

window.addEventListener('scroll', async () => {
  if (loading) return;

  const galleryHeight = gallery.getBoundingClientRect().height;
  const scrollPosition = window.scrollY + window.innerHeight;

  if (scrollPosition >= galleryHeight - SCROLL_THRESHOLD) {
    currentPage++;
    await fetchImages(currentSearchQuery, currentPage);
  }
});


async function fetchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: ITEMS_PER_PAGE,
        page: page,
      },
    });

    const { hits, totalHits } = response.data;
    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    displayImages(hits);
    lightbox.refresh();

    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    if (hits.length < ITEMS_PER_PAGE) {
      // loadMoreButton.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      // loadMoreButton.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}


function displayImages(images) {
    const imageCards = images.map((image) => {
      const card = document.createElement('div');
      card.innerHTML = `
        <a href="${image.largeImageURL}" class="photo-card">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>: ${image.likes}</p>
            <p class="info-item"><b>Views</b>: ${image.views}</p>
            <p class="info-item"><b>Comments</b>: ${image.comments}</p>
            <p class="info-item"><b>Downloads</b>: ${image.downloads}</p>
          </div>
        </a>
      `;
  
      return card;
    });
  
    gallery.append(...imageCards);
    lightbox.refresh(); 
  }