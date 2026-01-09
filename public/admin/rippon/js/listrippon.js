let currentRibbon = "";

async function loadRippons(){
    const res = await fetch('/rippon/api/ribbons');
    const data = await res.json();
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = "";

    data.forEach((r,i)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i+1}</td>
            <td>${r}</td>
            <td class="actions">
                <button class="edit" onclick="openEdit('${r}')">Edit</button>
                <button class="delete" onclick="deleteRippon('${r}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openEdit(ribbon){
    currentRibbon = ribbon;
    document.getElementById('editInput').value = ribbon;
    document.getElementById('editModal').style.display='flex';
}

function closeModal(){
    document.getElementById('editModal').style.display='none';
}

async function saveEdit(){
    const newRibbon = document.getElementById('editInput').value.trim();
    if(!newRibbon) return alert("Value required");

    const res = await fetch('/rippon/api/ribbon/edit',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ oldRibbon: currentRibbon, newRibbon })
    });

    const data = await res.json();
    if(data.success){
        closeModal();
        loadRippons();
    }else{
        alert("Update failed");
    }
}

async function deleteRippon(ribbon){
    if(!confirm(`Delete "${ribbon}" permanently?`)) return;

    const res = await fetch('/rippon/api/ribbon/delete',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ ribbon })
    });

    const data = await res.json();
    if(data.success){
        loadRippons();
    }else{
        alert("Delete failed");
    }
}

loadRippons();