const inputGroup = document.getElementById("inputGroup");
    document.getElementById("addField").onclick = () => {
        const row = document.createElement("div");
        row.className = "input-row";
        row.innerHTML = `
            <input type="text" name="ribbon" required>
            <button type="button" class="remove-btn">&times;</button>
        `;
        row.querySelector(".remove-btn").onclick = () => row.remove();
        inputGroup.appendChild(row);
    };