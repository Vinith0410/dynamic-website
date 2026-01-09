fetch('/page/api/pages')
  .then(res => res.json())
  .then(data => {

    /* HERO */
    hero.innerHTML = `
      <img src="/public/pages/uploads/${data.pages.page4.image}">
      <div class="hero-content">
        <div class="hero-inner">
          <h1>${data.pages.page4.heading}</h1>
          <p>${data.pages.page4.detail}</p>
        </div>
      </div>
    `;

    const c = data.pages.page4?.contact || {};
    const address =
      c.address ||
      [c.dnumber, c.streetname, c.city, c.district, c.state, c.zipcode]
        .filter(Boolean)
        .join(', ');
    const phone = [c.primaryphone, c.secondaryphone].filter(Boolean).join(' / ') || c.phone || '';
    const email = c.supportemail || c.email || '';
    const hours = c.workinghours || c.hours || '';

    /* CONTACT GRID WITH ICONS */
    const cg = document.getElementById('contact-grid');
    cg.innerHTML = `
      <div class="contact-card">
        <div class="icon-box"><i class="fas fa-map-marker-alt"></i></div>
        <h4>Address</h4>
        <div class="value">${address || '—'}</div>
      </div>
      <div class="contact-card">
        <div class="icon-box"><i class="fas fa-phone"></i></div>
        <h4>Phone</h4>
        <div class="value">${phone || '—'}</div>
      </div>
      <div class="contact-card">
        <div class="icon-box"><i class="fas fa-envelope"></i></div>
        <h4>Email</h4>
        <div class="value">${email || '—'}</div>
      </div>
      <div class="contact-card">
        <div class="icon-box"><i class="fas fa-clock"></i></div>
        <h4>Working Hours</h4>
        <div class="value">${hours || '—'}</div>
      </div>
    `;

    /* CONTACT ACTIONS BUTTON */
    const actions = document.getElementById('contact-actions');
    actions.innerHTML = '';
    if (c.mapUrl) {
      const a = document.createElement('a');
      a.href = getViewUrl(c.mapUrl);
      a.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Open Map';
      a.target = '_blank';
      actions.appendChild(a);
    }

    /* MAP IFRAME */
    const mp = document.getElementById('mapPreview');
    const mf = document.getElementById('mapFrame');
    if (c.mapUrl) {
      mf.src = getEmbedUrl(c.mapUrl);
      mp.style.display = 'block';
    } else {
      mp.style.display = 'none';
    }

    // Hide preloader after content is loaded
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }

  })
  .catch(err => {
    console.error('Failed to load contact page:', err);
    // Hide preloader even on error
    if (window.preloaderUtils) {
      window.preloaderUtils.hide();
    }
  });

/* EMBED URL */
function getEmbedUrl(url){
  try{
    const u = String(url);
    if (!/^https?:\/\//i.test(u)) return `https://www.google.com/maps?q=${encodeURIComponent(u)}&output=embed`;
    if (u.includes('output=embed') || u.includes('/embed')) return u;
    const atMatch = u.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=13&output=embed`;
    return `https://www.google.com/maps?q=${encodeURIComponent(u)}&output=embed`;
  } catch { return url; }
}

/* VIEW URL */
function getViewUrl(url){
  try{
    const u = String(url);
    if (!/^https?:\/\//i.test(u)) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u)}`;
    if (!u.includes('/embed')) return u;
    const at = u.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (at) return `https://www.google.com/maps/@${at[1]},${at[2]},13z`;
    return `https://www.google.com/maps`;
  } catch { return url; }
}
