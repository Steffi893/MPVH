document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Lightbox Functionality
    let currentGallery = [];
    let currentIndex = 0;

    let lbModal = document.querySelector('.lightbox-modal');
    if (!lbModal) {
        lbModal = document.createElement('div');
        lbModal.className = 'lightbox-modal';
        lbModal.innerHTML = `
            <button class="lightbox-close" aria-label="Schließen">&times;</button>
            <button class="lightbox-btn lightbox-prev" aria-label="Zurück">&#10094;</button>
            <div class="lightbox-content">
                <img class="lightbox-img" src="" alt="Großansicht">
                <div class="lightbox-counter">1 / 1</div>
            </div>
            <button class="lightbox-btn lightbox-next" aria-label="Weiter">&#10095;</button>
        `;
        document.body.appendChild(lbModal);
    }

    const lbImg = lbModal.querySelector('.lightbox-img');
    const lbCounter = lbModal.querySelector('.lightbox-counter');
    const lbClose = lbModal.querySelector('.lightbox-close');
    const lbPrev = lbModal.querySelector('.lightbox-prev');
    const lbNext = lbModal.querySelector('.lightbox-next');

    function updateLightbox() {
        if (!currentGallery.length) return;
        lbImg.src = currentGallery[currentIndex];
        lbCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
        lbPrev.style.display = currentGallery.length > 1 ? 'flex' : 'none';
        lbNext.style.display = currentGallery.length > 1 ? 'flex' : 'none';
    }

    function openLightbox(images, startIdx = 0) {
        if (!images || !images.length) return;
        currentGallery = images;
        currentIndex = startIdx;
        updateLightbox();
        lbModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lbModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function nextImage() {
        if (!currentGallery.length) return;
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightbox();
    }

    function prevImage() {
        if (!currentGallery.length) return;
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightbox();
    }

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    lbModal.addEventListener('click', (e) => {
        if (e.target === lbModal || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lbModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    // Attach click listeners to all photo stacks
    document.querySelectorAll('.photo-stack-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const raw = wrapper.getAttribute('data-gallery');
            if (raw) {
                try {
                    const imgs = JSON.parse(raw);
                    openLightbox(imgs);
                } catch (err) {
                    const single = wrapper.querySelector('.photo-stack-main');
                    if (single) {
                        const bg = single.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                        openLightbox([bg]);
                    }
                }
            }
        });
    });
});
