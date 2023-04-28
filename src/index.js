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

document.addEventListener('scroll', scrollGallerey);

let galleryImage = new SimpleLightbox('.gallery a');
galleryImage.on('show.simplelightbox', {
  captionDelay: '250',
});

function visible_loadMore() {
  if (!search.canBeScrolled) {
    loadMore.style.display = 'none';

    return;
  }
  loadMore.style.display = !search.visibleBtn ? 'none' : 'block';
}
visible_loadMore();

function handleSearch(e) {
  searchBtn.disabled = false;
  search.visibleBtn = false;

  search.value = e.target.value;
  search.page = 0;

  visible_loadMore();
}

function drawGallery(cards) {
  return cards
    .map(card => {
      return drawCard(card);
    })
    .join('');
}

function receiveData({ data }) {
  search.visibleBtn = false;
  visible_loadMore();

  const gallerey = data.hits;

  if (gallerey.length > 0) {
    if (data.totalHits < search.page * search.per_page) {
      //забороняємо робити запити при скролі
      search.canBeScrolled = false;
      search.visibleBtn = false;

      visible_loadMore();

      //якщо у нас получений массив меньший за per_page ми
      if (data.totalHits <= search.per_page) {
        setTimeout(() => {
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          searchBtn.disabled = true;
        }, 2500);
      }
      if (search.page !== 1) {
        // search.canBeScrolled = false; //забороняємо робити запити при скролі
        search.page = 0;

        searchBtn.disabled = true;
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
    searchBtn.disabled = false;
    search.visibleBtn = true;
    visible_loadMore();

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
  search.visibleBtn = false;
  search.loaded = true;
  visible_loadMore();
  search.canBeScrolled = true;
  if (e) {
    e.preventDefault();
  }

  if (!search.value) {
    removeInnerHtml();
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
        search.loaded = false;
      });
  } catch (error) {
    console.log(error);
  }
}
function removeInnerHtml() {
  gallereyInfo.innerHTML = '';
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

//щоб подивитись як працює Scrolled треба розкоментувати виконання функції handleBtn() у функції  scrollGallerey()

function scrollGallerey() {
  const documentRect = document.documentElement.getBoundingClientRect();
  if (documentRect.bottom < document.documentElement.clientHeight + 150) {
    if (search.canBeScrolled) {
      if (!search.loaded) {
        searchBtn.disabled = false;
        visible_loadMore();
        // щоб вимкнути skroll треба закоментувати цей handleBtn()
        //=======================================
        handleBtn();
        //========================================
        search.loaded = true;
      }
    }
  }
}
