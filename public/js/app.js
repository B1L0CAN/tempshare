document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTLER ---
    const modalOverlay = document.getElementById("auth-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const themeBtn = document.getElementById("theme-toggle");
    
    const sections = {
        upload: document.getElementById("upload-section"),
        result: document.getElementById("result-section")
    };
    
    const nav = {
        guest: document.getElementById("guest-nav"),
        user: document.getElementById("user-nav"),
        authBtn: document.getElementById("auth-trigger-btn"),
        logoutBtn: document.getElementById("logout-btn"),
        logoBtn: document.getElementById("logo-btn")
    };

    const formEls = {
        fileInput: document.getElementById("file"),
        dropZone: document.getElementById("drop-zone"),
        fileList: document.getElementById("file-list-container"),
        limitBadge: document.getElementById("limit-badge"),
        expirySelect: document.getElementById("expiry-duration"),
        maxViews: document.getElementById("max-views"),
        burnCheck: document.getElementById("burn-check"),
        qrImage: document.getElementById("qr-image"),
        shareLink: document.getElementById("share-link")
    };

    const authTabs = {
        loginBtn: document.getElementById("tab-login"),
        registerBtn: document.getElementById("tab-register"),
        loginForm: document.getElementById("login-form"),
        registerForm: document.getElementById("register-form"),
        errorMsg: document.getElementById("auth-error-msg")
    };

    let selectedFiles = [];

    // --- 1. KARANLIK MOD ---
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        themeBtn.textContent = isDark ? "☀️" : "🌙";
    });

    // --- 2. GÜVENLİK ---
    formEls.burnCheck.addEventListener("change", (e) => {
        if(e.target.checked) {
            formEls.maxViews.value = 1;
            formEls.maxViews.disabled = true; 
        } else {
            formEls.maxViews.disabled = false;
        }
    });

    // --- 3. MODAL & AUTH ---
    const openModal = (mode = 'login') => {
        modalOverlay.style.display = 'flex';
        authTabs.errorMsg.textContent = "";
        if (mode === 'login') authTabs.loginBtn.click();
        else authTabs.registerBtn.click();
    };
    const closeModal = () => modalOverlay.style.display = 'none';

    nav.authBtn.addEventListener("click", () => openModal('login'));
    closeModalBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

    authTabs.loginBtn.addEventListener("click", () => {
        authTabs.loginBtn.classList.add("active");
        authTabs.registerBtn.classList.remove("active");
        authTabs.loginForm.style.display = "block";
        authTabs.registerForm.style.display = "none";
        authTabs.errorMsg.textContent = "";
    });
    authTabs.registerBtn.addEventListener("click", () => {
        authTabs.registerBtn.classList.add("active");
        authTabs.loginBtn.classList.remove("active");
        authTabs.registerForm.style.display = "block";
        authTabs.loginForm.style.display = "none";
        authTabs.errorMsg.textContent = "";
    });

    // --- GİRİŞ & KAYIT MANTIĞI (DÜZELTİLDİ) ---

    // Kayıt Formu
    authTabs.registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const honeypot = document.getElementById("spam-trap").value;
        if (honeypot) return; 

        const pass = document.getElementById("reg-pass").value;
        const passConfirm = document.getElementById("reg-pass-confirm").value;
        if (pass.length < 6) { authTabs.errorMsg.textContent = "Şifre çok kısa."; return; }
        if (pass !== passConfirm) { authTabs.errorMsg.textContent = "Şifreler eşleşmiyor."; return; }

        // DÜZELTME 1: Formdaki ismi alıp loginUser'a gönderiyoruz
        const userName = document.getElementById("reg-name").value;
        loginUser(userName);
        closeModal();
    });

    // Giriş Formu
    authTabs.loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // DÜZELTME 2: E-posta adresinden isim türetiyoruz (Veritabanı olmadığı için)
        // Örn: mehmet@gmail.com -> Mehmet
        const email = authTabs.loginForm.querySelector('input[type="email"]').value;
        let derivedName = email.split('@')[0];
        // İlk harfi büyüt
        derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
        
        loginUser(derivedName);
        closeModal();
    });

    nav.logoutBtn.addEventListener("click", logoutUser);

    function loginUser(name) {
        nav.guest.style.display = "none";
        nav.user.style.display = "block";
        document.getElementById("user-name-display").textContent = name;
        formEls.limitBadge.textContent = "Limit: 100MB (Üye)";
        formEls.limitBadge.parentElement.parentElement.classList.add("premium-active");
        formEls.expirySelect.querySelector(".premium-option").disabled = false;
        formEls.expirySelect.querySelector(".premium-option").textContent = "7 Gün";
    }

    function logoutUser() {
        nav.guest.style.display = "block";
        nav.user.style.display = "none";
        formEls.limitBadge.textContent = "Limit: 50MB";
        formEls.limitBadge.parentElement.parentElement.classList.remove("premium-active");
        const opt = formEls.expirySelect.querySelector(".premium-option");
        opt.disabled = true; opt.textContent = "7 Gün (Üye)";
        formEls.expirySelect.value = "1h";
    }

    // --- 4. DRAG & DROP & PASTE ---
    formEls.dropZone.addEventListener("click", () => formEls.fileInput.click());
    
    const handleFiles = (files) => {
        const newFiles = Array.from(files);
        selectedFiles = [...selectedFiles, ...newFiles];
        updateUI();
    };

    formEls.fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

    formEls.dropZone.addEventListener("dragover", (e) => { e.preventDefault(); formEls.dropZone.classList.add("drag-over"); });
    formEls.dropZone.addEventListener("dragleave", () => formEls.dropZone.classList.remove("drag-over"));
    formEls.dropZone.addEventListener("drop", (e) => {
        e.preventDefault(); formEls.dropZone.classList.remove("drag-over");
        handleFiles(e.dataTransfer.files);
    });

    document.addEventListener('paste', (event) => {
        if (sections.upload.style.display === 'none') return; 
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                handleFiles([blob]);
            }
        }
    });

    function updateUI() {
        formEls.fileList.innerHTML = "";
        selectedFiles.forEach((file, index) => {
            const li = document.createElement("li");
            li.className = "ts-file-item";
            // Kapatma butonu (X) artık daha büyük
            li.innerHTML = `<span>${file.name}</span> <button type="button" class="ts-remove-btn" data-idx="${index}">×</button>`;
            formEls.fileList.appendChild(li);
        });
        document.querySelectorAll(".ts-remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                selectedFiles.splice(e.target.dataset.idx, 1);
                updateUI();
            });
        });
    }

    // --- 5. SİMÜLASYON ---
    document.getElementById("upload-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if (!selectedFiles.length) {
            alert("Lütfen önce en az bir dosya ekleyin.");
            return;
        }
        const progressFill = document.getElementById("progress-fill");
        document.getElementById("progress-container").style.display = "block";
        
        let width = 0;
        const interval = setInterval(() => {
            width += 5;
            progressFill.style.width = width + "%";
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    sections.upload.style.display = 'none';
                    sections.result.style.display = 'block';
                    
                    const uniqueID = Math.random().toString(36).substring(7);
                    const finalLink = window.location.origin + "/d/" + uniqueID;
                    formEls.shareLink.value = finalLink;
                    formEls.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${finalLink}`;
                    
                }, 500);
            }
        }, 50);
    });

    document.getElementById("new-upload-btn").addEventListener("click", () => {
        sections.result.style.display = 'none';
        sections.upload.style.display = 'block';
        document.getElementById("progress-container").style.display = 'none';
        selectedFiles = [];
        updateUI();
    });

    document.getElementById("copy-btn").addEventListener("click", () => {
        formEls.shareLink.select();
        document.execCommand("copy");
    });
});