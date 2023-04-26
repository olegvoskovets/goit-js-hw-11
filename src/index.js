import axios from 'axios';
import { Notify } from 'notiflix';
const KEY_PIXABAY = `35768020-57bf980d1d69223dcc2d256cc`;

const search = {
  value: null,
  page: null,
  per_page: 40,
  visibleBtn: false,
};

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('input', handleSearch);

const searchBtn = searchForm.querySelector('button');
searchBtn.addEventListener('click', handleBtn);

const gallereyInfo = document.querySelector('.gallery');

const loadMore = document.querySelector('.load-more');
loadMore.addEventListener('click', handleBtn);

const data = {
  data: null,
};

function visible_loadMore() {
  loadMore.style.display = !search.page ? 'none' : 'block';
}
visible_loadMore();

function drawCard(card) {
  return `
  <div class="photo-card">
  <img src=${card.webformatURL} alt=${card.tags} loading="lazy" width='350' height = '235' />
  <div class="info">
    <p class="info-item">
      <b>Likes <span>${card.likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views <span>${card.views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments <span>${card.comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads <span>${card.downloads}</span> </b>
    </p>
  </div>
</div>
  `;
  //
}

function handleSearch(e) {
  search.value = e.target.value;
  search.page = 0;
}

function drawGallery(cards) {
  return cards
    .map(card => {
      return drawCard(card);
    })
    .join('');
}

function receiveData({ data }) {
  if (data.totalHits < search.page * search.per_page) {
    search.page = 0;
    visible_loadMore();
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }

  const gallerey = data.hits;

  if (gallerey.length > 0) {
    const marcup = drawGallery(gallerey);
    if (marcup) {
      gallereyInfo.insertAdjacentHTML('beforeend', marcup);
    }
    Notify.success(`Hooray! We found ${search.page * search.per_page} images.`);
    return;
  }
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
  search.page = 0;
  visible_loadMore();
}

function errorGallery() {
  Notify.failure('Sorry, что-то пошло не так !!!.');
}

function handleBtn(e) {
  e.preventDefault();

  if (!search.page) {
    gallereyInfo.innerHTML = '';
    visible_loadMore();
  }

  try {
    getPixabay().then(receiveData).catch(errorGallery);
  } catch (error) {
    console.log(error);
  }
}

async function getPixabay() {
  search.page += 1;
  const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}&image_type=photo&orientation=horizontal&safesearch=true&q=${search.value}&page=${search.page}&per_page=${search.per_page}`;
  const res = await axios.get(url);
  visible_loadMore();
  return res;
}
