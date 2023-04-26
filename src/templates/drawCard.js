export default function drawCard(card) {
  return `
   
     <a href="${card.largeImageURL}" >
        <div class="photo-card">
           <img  class='gallery__image' src=${card.webformatURL} alt=${card.tags} title=${card.tags} loading="lazy" width='350' height = '235' />
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
     </a>
  
    `;
}
//
