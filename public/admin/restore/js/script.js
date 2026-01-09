async function loadDeleted(){
  try{
    const res = await fetch('/product/api/pages/deleted');
    const items = await res.json();
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    if(!Array.isArray(items) || items.length===0){
      document.getElementById('empty').style.display='block';
      return;
    }
    items.forEach(i=>{
      const card = document.createElement('div');
      card.className = 'card';
      const isImage = i.type==='image' && typeof i.value==='string';
      card.innerHTML = `
        <div class="path">${i.path}</div>
        ${isImage
          ? `<img class="preview" src="/uploads/${i.value}" onerror="this.src='https://via.placeholder.com/400x160?text=No+Image'">`
          : `<div class="value">${String(i.value)}</div>`
        }
        <div class="meta">Type: ${i.type} • Deleted: ${new Date(i.deletedAt).toLocaleString()}</div>
        <div class="actions">
          <button class="btn restore" onclick="restore('${i._id}')">Restore</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }catch(e){
    console.error(e);
  }
}

async function restore(id){
  try{
    const res = await fetch('/product/api/pages/restore',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id })
    });
    const data = await res.json();
    if(data.success){
      alert('Restored successfully');
      loadDeleted();
    }else{
      alert('Restore failed');
    }
  }catch(e){
    alert('Restore failed');
  }
}

loadDeleted();