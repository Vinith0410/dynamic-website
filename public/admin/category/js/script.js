 /* SUB CATEGORY LOGIC */
    const addBtn = document.getElementById("addSubCategory");
    const container = document.getElementById("subCategoryContainer");
    const maxFields = 5;

    addBtn.addEventListener("click", () => {
        if (container.children.length < maxFields) {
            const input = document.createElement("input");
            input.type = "text";
            input.name = "subcategory[]";
            input.placeholder = "Enter sub-category";
            input.required = true;
            container.appendChild(input);
        }

        if (container.children.length === maxFields) {
            addBtn.style.display = "none";
        }
    });

    /* IMAGE PREVIEW LOGIC */
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const previewText = document.querySelector(".preview-text");

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (file) {
            previewImage.src = URL.createObjectURL(file);
            previewImage.style.display = "block";
            previewText.style.display = "none";
        } else {
            previewImage.style.display = "none";
            previewText.style.display = "block";
        }
    });