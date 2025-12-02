document.addEventListener("DOMContentLoaded", () => {
    
    // --- ELEMENTLER ---
    const sections = {
        upload: document.getElementById("upload-section"),
        result: document.getElementById("result-section")
    };
    
    const formEls = {
        uploadForm: document.getElementById("upload-form"), // Form elementi eklendi
        fileInput: document.getElementById("file"),
        dropZone: document.getElementById("drop-zone"),
        fileList: document.getElementById("file-list-container"),
        maxViews: document.getElementById("max-views"),
        burnCheck: document.getElementById("burn-check"),
        qrImage: document.getElementById("qr-image"),
        shareLink: document.getElementById("share-link")
    };

    let selectedFiles = [];

    // --- 1. GÜVENLİK (Yakma Özelliği) ---
    if(formEls.burnCheck) {
        formEls.burnCheck.addEventListener("change", (e) => {
            if(e.target.checked) {
                formEls.maxViews.value = 1;
                formEls.maxViews.disabled = true; 
            } else {
                formEls.maxViews.disabled = false;
            }
        });
    }

    // --- 2. DRAG & DROP & DOSYA SEÇİMİ ---
    
    // Tıklayarak seçme
    if(formEls.dropZone) {
        formEls.dropZone.addEventListener("click", () => formEls.fileInput.click());
    
        // Sürükleme Efektleri
        formEls.dropZone.addEventListener("dragover", (e) => { 
            e.preventDefault(); 
            formEls.dropZone.classList.add("drag-over"); 
        });

        // HATA BURADAYDI: Fazladan noktalı virgül kaldırıldı
        formEls.dropZone.addEventListener("dragleave", () => {
            formEls.dropZone.classList.remove("drag-over"); 
        });

        formEls.dropZone.addEventListener("drop", (e) => {
            e.preventDefault(); 
            formEls.dropZone.classList.remove("drag-over");
            handleFiles(e.dataTransfer.files);
        });
    }

    // Input değişince (Gözat butonu)
    if(formEls.fileInput) {
        formEls.fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
    }

    const handleFiles = (files) => {
        const newFiles = Array.from(files);
        selectedFiles = [...selectedFiles, ...newFiles];
        updateUI();
    };

    // Yapıştırma (Ctrl+V) Desteği
    document.addEventListener('paste', (event) => {
        // Eğer upload ekranı gizliyse (sonuç ekranındaysak) çalışmasın
        if (sections.upload.style.display === 'none') return; 
        
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                handleFiles([blob]);
            }
        }
    });

    // Arayüzü Güncelleme (Liste)
    function updateUI() {
        if(!formEls.fileList) return;
        
        formEls.fileList.innerHTML = "";
        selectedFiles.forEach((file, index) => {
            const li = document.createElement("li");
            li.className = "ts-file-item";
            li.innerHTML = `<span>${file.name}</span> <button type="button" class="ts-remove-btn" data-idx="${index}">×</button>`;
            formEls.fileList.appendChild(li);
        });
        
        // Silme butonlarını dinle
        document.querySelectorAll(".ts-remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                // Event bubbling'i durdur (Formun submit olmasını engellemek için)
                e.preventDefault(); 
                e.stopPropagation();
                
                const idx = parseInt(e.target.getAttribute("data-idx"));
                selectedFiles.splice(idx, 1);
                updateUI();
            });
        });
    }

    // --- 3. YÜKLEME SİMÜLASYONU ---
    if(formEls.uploadForm) {
        formEls.uploadForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            if(selectedFiles.length === 0) {
                alert("Lütfen bir dosya seçin.");
                return;
            }

            const progressFill = document.getElementById("progress-fill");
            const progressContainer = document.getElementById("progress-container");
            
            if(progressContainer) progressContainer.style.display = "block";
            
            let width = 0;
            const interval = setInterval(() => {
                width += 5;
                if(progressFill) progressFill.style.width = width + "%";
                
                if (width >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        sections.upload.style.display = 'none';
                        sections.result.style.display = 'block';
                        
                        // Rastgele Link Üret
                        const uniqueID = Math.random().toString(36).substring(7);
                        const finalLink = window.location.origin + "/d/" + uniqueID;
                        
                        if(formEls.shareLink) formEls.shareLink.value = finalLink;
                        
                        // QR Kod Üret (Harici API)
                        if(formEls.qrImage) {
                            formEls.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${finalLink}`;
                        }
                        
                    }, 500);
                }
            }, 50);
        });
    }

    // "Yeni Dosya Gönder" Butonu
    const newUploadBtn = document.getElementById("new-upload-btn");
    if(newUploadBtn) {
        newUploadBtn.addEventListener("click", () => {
            sections.result.style.display = 'none';
            sections.upload.style.display = 'block';
            
            const progressContainer = document.getElementById("progress-container");
            if(progressContainer) progressContainer.style.display = 'none';
            
            selectedFiles = [];
            updateUI();
            
            // Formu resetle
            if(formEls.uploadForm) formEls.uploadForm.reset();
        });
    }

    // Kopyala Butonu
    const copyBtn = document.getElementById("copy-btn");
    if(copyBtn && formEls.shareLink) {
        copyBtn.addEventListener("click", () => {
            formEls.shareLink.select();
            document.execCommand("copy");
            
            // Kullanıcıya kopyalandığını hissettir
            const originalText = copyBtn.innerHTML; // Muhtemelen 📋
            copyBtn.innerHTML = "✅";
            setTimeout(() => copyBtn.innerHTML = originalText, 1500);
        });
    }
});