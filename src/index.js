import axios from 'axios';
import { Notify } from 'notiflix';
const KEY_PIXABAY = `35768020-57bf980d1d69223dcc2d256cc`;

const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}&image_type=photo&orientation=horizontal&safesearch=true&q=`;

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('input', handleSearch);

const searchBtn = searchForm.querySelector('button');
searchBtn.addEventListener('click', handleBtn);

const gallereyInfo = document.querySelector('.gallery');

const search = {
  value: null,
};

const data = {
  data: null,
};
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
}

function drawGallery(cards) {
  return cards
    .map(card => {
      return drawCard(card);
    })
    .join('');
}

function receiveData({ data }) {
  const gallerey = data.hits;

  if (gallerey.length > 0) {
    const marcup = drawGallery(gallerey);
    if (marcup) {
      gallereyInfo.innerHTML = marcup;
    }
    return;
  }
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function errorGallery() {
  Notify.failure('Sorry, что-то пошло не так !!!.');
}

function handleBtn(e) {
  e.preventDefault();
  try {
    getPixabay().then(receiveData).catch(errorGallery);
  } catch (error) {
    console.log(error);
  }
}

async function getPixabay() {
  const res = await axios.get(url + search.value);
  return res;
}
