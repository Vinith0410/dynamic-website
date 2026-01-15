async function loadFooter(){
  try{
    const res = await fetch('/page/api/pages');
    const data = await res.json();
    console.log(data.pages.footer)
    const f = data.pages?.footer || {};
    footerBrand.innerText = f.brand || '';
    footerTagline.innerText = f.tagline || '';
    footerDesc.innerText = f.description || '';
    const socials = f.social || {};
    footerSocials.innerHTML = '';

    const socialIcons = {
      facebook: 'fab fa-facebook-f',
      instagram: 'fab fa-instagram',
      twitter: 'fab fa-twitter',
      youtube: 'fab fa-youtube'
    };

    ['facebook','instagram','twitter','youtube'].forEach(k => {
      if (socials[k]) {
        const a = document.createElement('a');
        a.href = socials[k]; // your account link
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'social-link';
        a.innerHTML = `<i class="${socialIcons[k]}"></i>`; // icon
        footerSocials.appendChild(a);
      }
    });

    const quick = f.quickLinks || [];
    const routes = ['/home','/about','/services','/contact'];
    footerQuick.innerHTML = quick.map((t,i)=>`<li><a href="${routes[i]||'#'}">${t}</a></li>`).join('');
    const cats = f.categories || [];
    footerCats.innerHTML = cats.map(c=>`<li><a href="/our-product?category=${encodeURIComponent(c)}">${c}</a></li>`).join('');
    const contact = f.contact || {};
    const addressParts = [
      contact.dnumber,
      contact.streetname,
      contact.city,
      contact.district,
      contact.state,
      contact.zipcode
    ].filter(Boolean);
    footerAddress.innerText = addressParts.join(', ');
    const phones = [contact.primaryphone, contact.secondaryphone].filter(Boolean);
    footerPhone.innerText = phones.join(' / ');
    footerEmail.innerText = contact.supportemail || '';
    footerHours.innerText = contact.workinghours || '';
    footerYear.innerText = new Date().getFullYear();
    footerBrandLine.innerHTML =
  (f.brand ? f.brand + ' | ' : '') +
  `<a href="https://www.brightfutureacad.in" target="_blank" rel="noopener" style="color:#007BFF; text-decoration:none;">Developed by Bright Future Academy</a>`;

  }catch(e){
    console.error('Footer load failed', e);
  }
}
loadFooter();
