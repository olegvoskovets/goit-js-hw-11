import { Notify } from 'notiflix';
import API from './api/api_server.js';

import drawCard from './templates/drawCard.js';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY_PIXABAY = `35768020-57bf980d1d69223dcc2d256cc`;

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('input', handleSearch);

const searchBtn = searchForm.querySelector('button');
searchBtn.addEventListener('click', handleBtn);

const gallereyInfo = document.querySelector('.gallery');
gallereyInfo.addEventListener('click', onPalettContainerClick);

const loadMore = document.querySelector('.load-more');
loadMore.addEventListener('click', handleBtn);

let galleryImage = new SimpleLightbox('.gallery a');
galleryImage.on('show.simplelightbox', {
  captionDelay: '250',
});

const search = {
  value: null,
  page: null,
  per_page: 40,
  visibleBtn: false,
};

function visible_loadMore() {
  loadMore.style.display = !search.visibleBtn ? 'none' : 'block';
}
visible_loadMore();

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
    search.visibleBtn = false;
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
      galleryImage.refresh();
    }

    Notify.success(`Hooray! We found ${search.page * search.per_page} images.`);
    search.visibleBtn = true;
    visible_loadMore();

    const { height: cardHeight, width: cardWidth } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    console.log({
      height: cardHeight,
      width: cardWidth,
    });

    window.scrollBy({
      top: cardHeight * 14,
      behavior: 'smooth',
    });

    return;
  }

  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );

  search.page = 0;
  search.visibleBtn = false;
  visible_loadMore();
}

function errorGallery({ res }) {
  Notify.failure('Sorry, что-то пошло не так !!!.');
}

function handleBtn(e) {
  e.preventDefault();
  search.visibleBtn = false;
  visible_loadMore();

  if (!search.value) {
    Notify.failure('Виберіть критерій пошуку !!!.');
    return;
  }

  if (!search.page) {
    gallereyInfo.innerHTML = '';
  }

  try {
    search.page += 1;
    const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}&image_type=photo&orientation=horizontal&safesearch=true&q=${search.value}&page=${search.page}&per_page=${search.per_page}`;
    API(url).then(receiveData).catch(errorGallery);
  } catch (error) {
    console.log(error);
  }
}

function onPalettContainerClick(e) {
  e.preventDefault();
  if (!e.target.classList.contains('gallery__image')) {
    return;
  }

  document.addEventListener('keydown', event => {
    if (event.code === 'Escape') {
      galleryImage.close();
    }
  });
}
