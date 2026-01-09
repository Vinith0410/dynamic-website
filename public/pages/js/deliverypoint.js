fetch('/page/api/pages')
.then(res => res.json())
.then(data => {
  const deliveryImage = data.pages.page3.imagedelivery;
  const points = Array.isArray(data.pages.page3.points) ? data.pages.page3.points.filter(Boolean) : [];
  const deliveryCard = document.getElementById('delivery-card');
  deliveryCard.innerHTML += `
    <div class="delivery-image">
      <img src="/public/pages/uploads/${deliveryImage}" onerror="this.src='https://via.placeholder.com/360x280?text=No+Image'">
    </div>
    <div class="delivery-content">
      <p>${data.pages.page3.detail || ''}</p>
      ${
        points.length
          ? `<ul class="points-list">${points.map(p=>`<li>${p}</li>`).join('')}</ul>`
          : `<p style="color:#888;">No points available</p>`
      }
    </div>
  `;
});
