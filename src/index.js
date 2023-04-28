import { Notify } from 'notiflix';
import API from './api/api_server.js';

import drawCard from './templates/drawCard.js';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { search } from './templates/stateSearch.js';

import Url from './api/url.js';

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('input', handleSearch);

const searchBtn = searchForm.querySelector('button');
searchBtn.addEventListener('click', handleBtn);

const gallereyInfo = document.querySelector('.gallery');
gallereyInfo.addEventListener('click', onPalettContainerClick);

const loadMore = document.querySelector('.load-more');
loadMore.addEventListener('click', handleBtn);

window.addEventListener('scroll', scrollGallerey);

let galleryImage = new SimpleLightbox('.gallery a');
galleryImage.on('show.simplelightbox', {
  captionDelay: '250',
});

function visible_loadMore() {
  if (!search.canBeScrolled) {
    loadMore.style.display = 'none';
    searchBtn.disabled = true;
    return;
  }
  loadMore.style.display = !search.visibleBtn ? 'none' : 'block';
}
visible_loadMore();

function handleSearch(e) {
  searchBtn.disabled = false;
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
  console.log(search);
  const gallerey = data.hits;

  if (gallerey.length > 0) {
    if (data.totalHits < search.page * search.per_page) {
      //забороняємо робити запити при скролі
      search.canBeScrolled = false;
      search.visibleBtn = false;
      visible_loadMore();
      //якщо у нас получений массив меньший за per_page ми забороняємо скролл
      if (data.totalHits <= search.per_page) {
        setTimeout(() => {
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
        }, 2000);
        //search.page = 0;
      }
      if (search.page !== 1) {
        // search.canBeScrolled = false; //забороняємо робити запити при скролі
        search.page = 0;
        // search.visibleBtn = false;
        // visible_loadMore();
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );

        return;
      }
    }
    const marcup = drawGallery(gallerey);

    if (marcup) {
      gallereyInfo.insertAdjacentHTML('beforeend', marcup);
      galleryImage.refresh();
    }
    if (search.page === 1) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    // search.visibleBtn = true;
    // visible_loadMore();

    const { height: cardHeight, width: cardWidth } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    console.log({
      height: cardHeight,
      width: cardWidth,
    });

    window.scrollBy({
      top: cardHeight,
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

function validUrl() {
  search.page += 1;
  return Url();
}

function handleBtn(e) {
  searchBtn.disabled = true;
  if (e) {
    e.preventDefault();
    search.canBeScrolled = true;
  }

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
    API(validUrl())
      .then(receiveData)
      .catch(errorGallery)
      .finally(() => {
        search.loaded = true;
      });
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

//щоб подивитись як працює кнопка загрузок треба розкоментувати виконання функції handleBtn()

function scrollGallerey() {
  const documentRect = document.documentElement.getBoundingClientRect();
  if (documentRect.bottom < document.documentElement.clientHeight + 5) {
    if (search.canBeScrolled) {
      if (search.loaded) {
        search.visibleBtn = true;
        searchBtn.disabled = false;
        visible_loadMore();
        // handleBtn();
        search.loaded = false;
      }
    }
  }
}
