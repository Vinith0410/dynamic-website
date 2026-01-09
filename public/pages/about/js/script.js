fetch('/page/api/pages')
.then(res=>res.json())
.then(data=>{


  const p = data.pages.page2;

  /* HERO */
  hero.innerHTML = `
    <img src="/public/pages/uploads/${p.header.image}">
    <div class="hero-content">
      <div class="hero-inner">
        <h1>${p.title}</h1>
        <p>${p.header.detail}</p>
      </div>
    </div>
  `;

  /* ABOUT */
  aboutTitle.innerText = p.about.name;
  aboutSubtitle.innerText = p.about.subtitle;
  aboutImg.src = `/public/pages/uploads/${p.about.image}`;
  aboutImg.onerror = function(){ this.src='https://via.placeholder.com/600x350?text=No+Image'; }
  aboutHeading.innerText = p.about.heading;
  aboutDetails.innerText = p.about.details;

  function normalizeSection(data) {
  if (!data) return {};

  return {
    title: data.title || data.name || '',
    subtitle: data.subtitle || '',
    details: data.details || data.description || '',
    points: Array.isArray(data.points) ? data.points : []
  };
}

function renderInfoSection(rawData, els) {
  const data = normalizeSection(rawData);

  els.title.innerText = data.title;
  els.details.innerText = data.details;
  els.cards.innerHTML = '';

  data.points.forEach((pt, index) => {
    const side = index % 2 === 0 ? 'right' : 'left';

    els.cards.innerHTML += `
      <div class="timeline-item ${side}">
        <div class="timeline-card">
          <h4>${pt.title}</h4>
          <p>${pt.description}</p>
        </div>
      </div>
    `;
  });
}

console.log(p.mission)
console.log(p.vision)
/* CALL */
renderInfoSection(p.mission, {
  title: missionTitle,
  details: missionDetails,
  cards: missionCards
});

renderInfoSection(p.vision, {
  title: visionTitle,
  details: visionDetails,
  cards: visionCards
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');   // animate IN
      } else {
        entry.target.classList.remove('show'); // reset when OUT
      }
    });
  },
  {
    threshold: 0.25,        // item must be 25% visible
    rootMargin: '0px 0px -100px 0px'
  }
);

document.querySelectorAll('.timeline-item').forEach(item => {
  observer.observe(item);
});



document.querySelectorAll('.timeline-item').forEach(item => {
  observer.observe(item);
});

  /* WHY US */
  whyTitle.innerText = p.why_us.name;
  whySubtitle.innerText = p.why_us.subtitle;
  whyImg.src = `/public/pages/uploads/${p.why_us.image}`;

  p.why_us.features.forEach(f=>{
    whyFeatures.innerHTML += `<li>${f}</li>`;
  });

  // Hide preloader after content is loaded
  if (window.preloaderUtils) {
    window.preloaderUtils.hide();
  }
})
.catch(err => {
  console.error('Failed to load about page:', err);
  // Hide preloader even on error
  if (window.preloaderUtils) {
    window.preloaderUtils.hide();
  }
});