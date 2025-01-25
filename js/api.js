const movieContainer = document.querySelector('.movie-card-container');
const phimBo = document.querySelector('#phim-bo')
const mainContainer = document.querySelector('.main-card');
const detailContainer = document.getElementsByClassName('.movie-detail-container');
const paginationContainer = document.getElementById('pagination')
const apiURL = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1";
const path_img = "https://img.ophim.live/uploads/movies/"
let currentPage = 1;
let totalPages = 1;

async function initializeCarousel() {
    try {
        const response = await axios.get(apiURL);
        const item = response.data.items;
        console.log(item);

        const carouselQuantity = item.slice(0, 10);
        const carouselTrack = document.querySelector('.carousel-track');

        carouselTrack.innerHTML = ``;

        carouselQuantity.forEach(items => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.setAttribute('data-id', items.slug)
            slide.innerHTML = `
                <img src="${path_img}${items.poster_url}" alt="${items.name}">
                <div class="slide-content">
                    <h2>${items.name}</h2>
                    <p>${items.origin_name}</p>
                    <p>${items.year}</p>
                </div>
            `;
            // Thêm event listener trực tiếp vào slide
            slide.addEventListener('click', function () {
                const filmId = this.getAttribute('data-id');
                window.location.href = `/Pages/detailpage.html?id=${filmId}`;
            });
            carouselTrack.appendChild(slide);
        });

        // Điều khiển carousel
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlide = slides.length;
        let autoAdvanceInterval; // Khai báo biến interval ở scope cao hơn

        // Tạo dots
        const dotsContainer = document.querySelector('.carousel-dots');
        dotsContainer.innerHTML = '';

        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function goToSlide(index) {
            currentSlide = index;
            updateCarousel();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlide;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlide) % totalSlide;
            updateCarousel();
        }

        // Hàm bắt đầu auto advance
        function startAutoAdvance() {
            // Clear interval cũ nếu có
            if (autoAdvanceInterval) {
                clearInterval(autoAdvanceInterval);
            }
            // Tạo interval mới
            autoAdvanceInterval = setInterval(nextSlide, 5000);
        }

        // Hàm dừng auto advance
        function stopAutoAdvance() {
            if (autoAdvanceInterval) {
                clearInterval(autoAdvanceInterval);
                autoAdvanceInterval = null;
            }
        }

        // Add button event listeners
        const prevButton = document.querySelector('.carousel-button.prev');
        const nextButton = document.querySelector('.carousel-button.next');

        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);

        // Xử lý hover
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.addEventListener('mouseenter', stopAutoAdvance);
        carouselContainer.addEventListener('mouseleave', startAutoAdvance);

        // Khởi động auto advance ban đầu
        startAutoAdvance();

        // Initial update
        updateCarousel();

    } catch (error) {
        console.error('Error initializing carousel:', error);
        const carouselTrack = document.querySelector('.carousel-track');
        carouselTrack.innerHTML = `
            <div class="carousel-error">
                <p>Failed to load carousel. Please try again later.</p>
            </div>
        `;
    }

}




async function loadMovies(page = 1) {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();

        const movies = data.items;
        const baseImageUrl = data.pathImage;
        totalPages = data.pagination.totalPages;
        currentPage = page;

        movieContainer.innerHTML = movies.map((item) => `
            <div class="card" data-id="${item.slug}">
                <img class="img-card" src="${baseImageUrl}${item.thumb_url}" alt="Movie Title">
                <div class="content">
                    <span>${item.name}</span>
                </div>
                <div class="play-button"></div>
            </div>
        `).join('');

        // Keep your existing click handlers
        const filmCards = document.querySelectorAll('.card');
        filmCards.forEach(card => {
            card.addEventListener('click', function () {
                const filmId = card.getAttribute('data-id');
                window.location.href = `/Pages/detailpage.html?id=${filmId}`;
            });
        });

    } catch (error) {
        console.error("Error loading movies:", error);
    }
}
// Initialize both carousel and movies when on index page

if (window.location.pathname.includes('/')) {
    initializeCarousel();
    loadMovies();
}




async function getPhimBo(page = 1) {
    const phimBoContainer = document.querySelector('#phim-bo');
    let apiUrl = 'https://ophim1.com/v1/api/danh-sach/phim-bo?page=${page}';

    if (window.location.pathname.includes('phim-bo.html')) {
        apiUrl = `https://ophim1.com/v1/api/danh-sach/phim-bo?page=${page}`;
    }

    if (apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const res = await response.json();
            const data = res.data.items;
            console.log(data);

            if (data && data.length > 0) {
                phimBoContainer.innerHTML = data.map((movie) => `
                    <div class="card" data-id="${movie.slug}">
                        <img class="img-card" src="${path_img}${movie.thumb_url}" alt="${movie.name}">
                        <div class="content">
                            <span>${movie.name}</span>
                        </div>
                        <div class="play-button"></div>
                    </div>
                `).join('');

                // Add click event listeners to cards
                const filmCards = document.querySelectorAll('.card');
                filmCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const filmId = card.getAttribute('data-id');
                        window.location.href = `/Pages/detailpage.html?id=${filmId}`;
                    });
                });

            } else {
                console.warn("No movies found in API response.");
                phimBoContainer.innerHTML = `<p class="error-message">Không có phim bộ.</p>`;
            }
        } catch (error) {
            console.error("Error loading movies:", error);
            phimBoContainer.innerHTML = `<p class="error-message">Không thể tải phim bộ.</p>`;
        }
    }
}

// Call the function when on the TV shows page
if (window.location.pathname.includes('phim-bo.html')) {
    getPhimBo();
}



async function getDetailFilm() {
    const params = new URLSearchParams(window.location.search);
    const filmId = params.get('id');
    let apiDetailUrl = '';
    if (!filmId) {
        console.error('No film ID provided');
        return;
    }
    if (window.location.pathname.includes('detailpage.html')) {
        apiDetailUrl = `https://ophim1.com/phim/${filmId}`;
    }

    try {
        const response = await fetch(apiDetailUrl);
        const data = await response.json();
        console.log(data.episodes);
        const movie = data.movie;
        const moviePoster = document.querySelector('.movie-poster');
        const movieInfo = document.querySelector('.movie-info');
        const backgroundOverlay = document.querySelector('.background-overlay');


        // Update background overlay
        backgroundOverlay.innerHTML = `<img src="${data.movie.poster_url}" alt="">
         <div class="gradient-overlay"></div> `;

        // Update movie details
        moviePoster.innerHTML = ` <img class="img-card" src="${data.movie.poster_url}" alt="Movie Poster">`;
        movieInfo.innerHTML = `
            <h1 class="movie-title">${movie.name}</h1>
            <p><strong>Năm Phát Hành:</strong> ${movie.year}</p>
            <p><strong>Thể Loại:</strong> ${movie.category.map((cate) => cate.name).join(', ')}</p>
            <p><strong>Đạo diễn:</strong> ${movie.director.join(', ') || 'Đang cập nhật'}</p>
            <p><strong>Quốc Gia:</strong> ${movie.country.map((countr) => countr.name).join(', ')}</p>
            <p><strong>Diễn Viên:</strong> <a style="line-height: 1.5;"> ${movie.actor.join(', ') || 'Đang cập nhật'} </a></p>
            <p class="movie-description">
                <strong>Nội dung phim:</strong>
                <a style="line-height: 1.5;">${movie.content}</a>
            </p>
        `;


        // // Lay danh sach tap phim
        if (data.episodes && data.episodes.length > 0) {
            const episodeList = document.querySelector('.episode-list');
            episodeList.innerHTML = data.episodes[0].server_data
                .map((ep, index) => `
                    <div class="episode-item">
                        <a href="#" data-link="${ep.link_embed}" class="episode-link">Tập ${ep.name}</a>
                    </div>
                `).join('');
        }
        detailContainer.innerHTML = moviePoster + movieInfo
        document.querySelectorAll(`.episode-link`).forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault()
                document.querySelectorAll(`.episode-link`).forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                const videoFrame = document.getElementById('video-frame')
                videoFrame.innerHTML = `<iframe src="${this.dataset.link}" frameborder="0" allowfullscreen></iframe>`;
                const infoBox = document.querySelector('.movie-detail-container')
                infoBox.style.display = "none"
                videoFrame.style.display = "block"
            })
        })
        document.querySelectorAll('.episode-link').onclick = function () {
            imgFilm
        }
        console.log(data)
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }

}
getDetailFilm()

async function getPhimTruyenHinh(page = 1) {
    const phimTruyenHinhContainer = document.querySelector('#phim-truyen-hinh');
    let apiUrl = '';

    if (window.location.pathname.includes('phim-truyen-hinh.html')) {
        apiUrl = `https://ophim1.com/v1/api/danh-sach/tv-shows?page=${page}`;
    }

    if (apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const res = await response.json();
            const data = res.data.items;

            if (data && data.length > 0) {
                phimTruyenHinhContainer.innerHTML = data.map((movie) => `
                    <div class="card" data-id="${movie.slug}">
                        <img class="img-card" src="${path_img}${movie.thumb_url}" alt="${movie.name}">
                        <div class="content">
                            <span>${movie.name}</span>
                        </div>
                        <div class="play-button"></div>
                    </div>
                `).join('');

                // Add click event listeners to cards
                const filmCards = document.querySelectorAll('.card');
                filmCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const filmId = card.getAttribute('data-id');
                        window.location.href = `/Pages/detailpage.html?id=${filmId}`;
                    });
                });

            } else {
                console.warn("No TV shows found in API response.");
                phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không có phim truyền hình.</p>`;
            }
        } catch (error) {
            console.error("Error loading TV shows:", error);
            phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không thể tải phim truyền hình.</p>`;
        }
    }
}

// Call the function when on the TV shows page
if (window.location.pathname.includes('phim-truyen-hinh.html')) {
    getPhimTruyenHinh();
}




async function getPhimHoatHinh(page = 1) {
    const phimTruyenHinhContainer = document.querySelector('#phim-hoat-hinh');
    let apiUrl = '';

    if (window.location.pathname.includes('phim-hoat-hinh.html')) {
        apiUrl = `https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=${page}`;
    }

    if (apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const res = await response.json();
            const data = res.data.items;
            console.log(data)

            if (data && data.length > 0) {
                phimTruyenHinhContainer.innerHTML = data.map((movie) => `
                    <div class="card" data-id="${movie.slug}">
                        <img class="img-card" src="${path_img}${movie.thumb_url}" alt="${movie.name}">
                        <div class="content">
                            <span>${movie.name}</span>
                        </div>
                        <div class="play-button"></div>
                    </div>
                `).join('');

                // Add click event listeners to cards
                const filmCards = document.querySelectorAll('.card');
                filmCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const filmId = card.getAttribute('data-id');
                        window.location.href = `/Pages/detailpage.html?id=${filmId}`;
                    });
                });

            } else {
                console.warn("No TV shows found in API response.");
                phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không có phim truyền hình.</p>`;
            }
        } catch (error) {
            console.error("Error loading TV shows:", error);
            phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không thể tải phim truyền hình.</p>`;
        }
    }
}

// Call the function when on the TV shows page
if (window.location.pathname.includes('phim-hoat-hinh.html')) {
    getPhimHoatHinh();
}




document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const mvsg = document.querySelector('#movie-suggest');

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async function searchMovies(keyword) {
        const apiUrl = `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data.data;
            console.log(data.items);
            let html = ''
            data.items.forEach(item => {
                html += `
                <div class="card-result" data-id="${item.slug}">
                    <img src="${path_img}${item.thumb_url}"  />     
                    <div class="card-result-name">${item.name}</div>
                </div>
                `
            })
            mvsg.innerHTML = html;
            const filmCards = document.querySelectorAll('.card-result');
            filmCards.forEach(card => {
                card.addEventListener('click', function () {
                    const filmId = card.getAttribute('data-id');
                    window.location.href = `/Pages/detailpage.html?id=${filmId}`;
                });
            });
        } catch (error) {
            console.error('Lỗi khi tìm kiếm phim:', error);
            searchResultsContainer.innerHTML = '<p>Đã xảy ra lỗi. Vui lòng thử lại.</p>';
        }
    }

    const debouncedSearch = debounce(function () {
        if (searchInput.value.trim() !== '') {
            searchMovies(searchInput.value.trim());
        }
    }, 500);

    searchInput.addEventListener('input', function () {
        mvsg.style.display = "block";
        debouncedSearch();
    });

});





async function getPhimLe(page = 1) {
    const phimTruyenHinhContainer = document.querySelector('#phim-le');
    let apiUrl = '';

    if (window.location.pathname.includes('phim-le.html')) {
        apiUrl = `https://ophim1.com/v1/api/danh-sach/phim-le?page=${page}`;
    }

    if (apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const res = await response.json();
            const data = res.data.items;
            console.log(data)

            if (data && data.length > 0) {
                phimTruyenHinhContainer.innerHTML = data.map((movie) => `
                    <div class="card" data-id="${movie.slug}">
                        <img class="img-card" src="${path_img}${movie.thumb_url}" alt="${movie.name}">
                        <div class="content">
                            <span>${movie.name}</span>
                        </div>
                        <div class="play-button"></div>
                    </div>
                `).join('');

                // Add click event listeners to cards
                const filmCards = document.querySelectorAll('.card');
                filmCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const filmId = card.getAttribute('data-id');
                        window.location.href = `/Pages/detailpage.html?id=${filmId}`;
                    });
                });

            } else {
                console.warn("No TV shows found in API response.");
                phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không có phim truyền hình.</p>`;
            }
        } catch (error) {
            console.error("Error loading TV shows:", error);
            phimTruyenHinhContainer.innerHTML = `<p class="error-message">Không thể tải phim truyền hình.</p>`;
        }
    }
}

// Call the function when on the TV shows page
if (window.location.pathname.includes('phim-le.html')) {
    getPhimLe();
}



///phan trang
// function page


async function loadPage(page) {
    currentPage = page;
    // Gọi hàm tải phim tương ứng với trang hiện tại
    if (window.location.pathname.includes('phim-bo.html')) {
        await getPhimBo(page);
    } else if (window.location.pathname.includes('phim-hoat-hinh.html')) {
        await getPhimHoatHinh(page);
    } else if (window.location.pathname.includes('phim-le.html')) {
        await getPhimLe(page);
    } else if (window.location.pathname.includes('phim-truyen-hinh.html')) {
        await getPhimTruyenHinh(page);
    }
    createPaginationButtons(totalPages, currentPage);
}

// Hàm để tạo các nút phân trang
function createPaginationButtons(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Nút Previous
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.addEventListener('click', () => {
            loadPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            loadPage(i);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Nút Next
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.addEventListener('click', () => {
            loadPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
}



