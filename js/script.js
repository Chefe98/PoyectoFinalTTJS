// CineFlix - Aplicación de alquiler y compra de películas
document.addEventListener('DOMContentLoaded', function() {
    // Datos de películas con precios convertidos a ARS (valores estimativos)
    const usdToArs = 1000;
    const moviesData = [
        {
            id: 1,
            title: "El Padrino",
            genre: "drama",
            price: 9.99 * usdToArs,
            rentPrice: 3.99 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
            type: "both"
        },
        {
            id: 2,
            title: "Avengers: Endgame",
            genre: "action",
            price: 14.99 * usdToArs,
            rentPrice: 4.99 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
            type: "both"
        },
        {
            id: 3,
            title: "Superbad",
            genre: "comedy",
            price: 8.99 * usdToArs,
            rentPrice: 2.99 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BMTc0NjIyMjA2OF5BMl5BanBnXkFtZTcwMzIxNDE1MQ@@._V1_.jpg",
            type: "rent"
        },
        {
            id: 4,
            title: "Interstellar",
            genre: "sci-fi",
            price: 12.99 * usdToArs,
            rentPrice: 3.99 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
            type: "buy"
        },
        {
            id: 5,
            title: "El Señor de los Anillos",
            genre: "action",
            price: 11.99 * usdToArs,
            rentPrice: 3.49 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",
            type: "both"
        },
        {
            id: 6,
            title: "Parásitos",
            genre: "drama",
            price: 10.99 * usdToArs,
            rentPrice: 3.99 * usdToArs,
            image: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
            type: "both"
        }
    ];

     // Redondear precios al mostrar
    function formatPrice(value) {
        return `$${Math.round(value).toLocaleString('es-AR')} ARS`;
    }

    // Variables globales
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let discountApplied = false;
    let discountPercentage = 0;
    const validPromoCodes = { 'CINEFLIX10': 10, 'PELICULA20': 20, 'ESTRENO15': 15 };

    // Mapeo de géneros
    const genreMap = {
        'action': 'Acción',
        'comedy': 'Comedia',
        'drama': 'Drama',
        'sci-fi': 'Ciencia Ficción'
    };

    // Elementos del DOM
    const elements = {
        movieContainer: document.getElementById('movie-container'),
        cartCount: document.getElementById('cart-count'),
        cartModal: document.getElementById('cart-modal'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartSubtotal: document.getElementById('cart-subtotal'),
        cartTotal: document.getElementById('cart-total'),
        cartDiscount: document.getElementById('cart-discount'),
        discountSection: document.getElementById('discount-section'),
        emptyCartMessage: document.getElementById('empty-cart-message'),
        promoCodeInput: document.getElementById('promo-code-input'),
        applyPromoBtn: document.getElementById('apply-promo-btn'),
        checkoutBtn: document.getElementById('checkout-btn'),
        closeModal: document.querySelector('.close-modal'),
        cartToggle: document.getElementById('cart-toggle'),
        genreFilter: document.getElementById('genre-filter'),
        typeFilter: document.getElementById('type-filter'),
        sortFilter: document.getElementById('sort-filter'),
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
        contactForm: document.getElementById('contact-form'),
        formMessage: document.getElementById('form-message'),
        loadingSpinner: document.getElementById('loading-spinner'),
        currentYear: document.getElementById('current-year')
    };

    // Inicialización
    init();

    function init() {
        renderMovies(moviesData);
        updateCartCount();
        if (cart.length > 0) renderCartItems();
        setupEventListeners();
        setCurrentYear();
        setupSmoothScrolling();
        setupFAQAccordion();
        
        // Manejar búsqueda desde URL si existe
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
            elements.searchInput.value = searchQuery;
            searchMovies();
        }
    }

    function setupEventListeners() {
        // Carrito
        elements.cartToggle.addEventListener('click', toggleCartModal);
        elements.closeModal.addEventListener('click', toggleCartModal);
        window.addEventListener('click', e => e.target === elements.cartModal && toggleCartModal());
        elements.applyPromoBtn.addEventListener('click', applyPromoCode);
        elements.checkoutBtn.addEventListener('click', checkout);

        // Filtros
        elements.genreFilter.addEventListener('change', filterMovies);
        elements.typeFilter.addEventListener('change', filterMovies);
        elements.sortFilter.addEventListener('change', sortMovies);

        // Búsqueda
        elements.searchBtn.addEventListener('click', searchMovies);
        elements.searchInput.addEventListener('keypress', e => e.key === 'Enter' && searchMovies());

        // Formulario de contacto
        elements.contactForm.addEventListener('submit', handleContactForm);
        
        // Validación en tiempo real
        elements.contactForm.name.addEventListener('input', validateName);
        elements.contactForm.email.addEventListener('input', validateEmail);
        elements.contactForm.message.addEventListener('input', validateMessage);
    }

    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const navHeight = document.querySelector('nav').offsetHeight;
                    const offset = headerHeight + navHeight + 20;
                    
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Actualizar URL
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    function setupFAQAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const answer = item.querySelector('.faq-answer');
                
                // Cerrar otros items
                document.querySelectorAll('.faq-item').forEach(faqItem => {
                    if (faqItem !== item) {
                        faqItem.querySelector('.faq-question').classList.remove('active');
                        faqItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });
                
                // Alternar el item actual
                question.classList.toggle('active');
                
                if (question.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            });
        });
    }

    function setCurrentYear() {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    function renderMovies(movies) {
        elements.loadingSpinner.style.display = 'none';
        
        if (!movies.length) {
            elements.movieContainer.innerHTML = '<p class="no-results">No se encontraron películas</p>';
            return;
        }

        elements.movieContainer.innerHTML = movies.map(movie => `
            <div class="movie-card" role="listitem">
                <img src="${movie.image}" alt="${movie.title}" class="movie-image" loading="lazy">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p class="genre">${getGenreName(movie.genre)}</p>
                    <div class="prices">
                        ${movie.type !== 'buy' ? `<p>Alquiler: <span class="price">${formatPrice(movie.rentPrice)}</span></p>` : ''}
                        ${movie.type !== 'rent' ? `<p>Compra: <span class="price">${formatPrice(movie.price)}</span></p>` : ''}
                    </div>
                    <div class="movie-actions">
                        ${createActionButton(movie, 'rent')}
                        ${createActionButton(movie, 'buy')}
                    </div>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.movie-actions button').forEach(btn => {
        btn.addEventListener('click', addToCart);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.movie-actions button').forEach(btn => {
            btn.addEventListener('click', addToCart);
        });
        
    }

    function createActionButton(movie, type) {
        const disabled = movie.type !== 'both' && movie.type !== type;
        return `
            <button class="btn ${type}-btn ${disabled ? 'disabled' : ''}" 
                    data-id="${movie.id}" data-type="${type}" 
                    ${disabled ? 'disabled aria-disabled="true"' : ''}
                    aria-label="${type === 'rent' ? 'Alquilar' : 'Comprar'} ${movie.title}">
                ${type === 'rent' ? 'Alquilar' : 'Comprar'}
            </button>
        `;
    }

    function getGenreName(genre) {
        return genreMap[genre] || genre;
    }

    function formatPrice(value) {
    return `$${Math.round(value).toLocaleString('es-AR')} ARS`;
    }


    function addToCart(e) {
    const button = e.currentTarget;
    if (button.disabled) return;

    const movieId = parseInt(button.dataset.id);
    const actionType = button.dataset.type;

    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) return;

    // Verificar si ya está en el carrito
    const existingItem = cart.find(item => item.id === movieId);

    // Lógica si ya fue COMPRADA
    if (existingItem && existingItem.type === 'buy') {
        showFeedback(`Ya compraste "${movie.title}". No necesitas comprarla ni alquilarla.`, 'info');
        return;
    }

    // Lógica si ya fue ALQUILADA y ahora quiere COMPRAR
    if (existingItem && existingItem.type === 'rent' && actionType === 'buy') {
        showFeedback(`Ya alquilaste "${movie.title}". No podés comprarla mientras esté alquilada.`, 'info');
        return;
    }

    // Si ya está alquilada y quiere alquilar de nuevo (extiende el tiempo)
    if (existingItem && existingItem.type === 'rent' && actionType === 'rent') {
        existingItem.quantity += 1;
        saveCart();
        updateCartDisplay();
        showFeedback(`Alquiler extendido: "${movie.title}" ahora es válido por ${existingItem.quantity * 48} horas.`, 'success');
        button.classList.add('added');
        setTimeout(() => button.classList.remove('added'), 1000);
        return;
    }

    // Si no existe aún: lo agregamos normalmente
    const item = {
        id: movie.id,
        title: movie.title,
        image: movie.image,
        type: actionType,
        typeName: actionType === 'rent' ? 'Alquiler' : 'Compra',
        price: actionType === 'rent' ? movie.rentPrice : movie.price,
        quantity: 1
    };

    cart.push(item);
    saveCart();
    updateCartDisplay();
    showFeedback(`"${movie.title}" añadida al carrito.`, 'success');

    // Animación
    button.classList.add('added');
    setTimeout(() => button.classList.remove('added'), 1000);
}


    function renderCartItems() {
    if (cart.length === 0) {
        elements.emptyCartMessage.style.display = 'block';
        elements.cartItemsContainer.innerHTML = '';
        return;
    }

    elements.emptyCartMessage.style.display = 'none';

    elements.cartItemsContainer.innerHTML = cart.map((item, index) => {
        // Duración del alquiler si aplica
        let extraInfo = '';
        if (item.type === 'rent') {
            const hours = item.quantity * 48;
            extraInfo = `<p class="alquiler-duracion">Alquiler por ${hours} horas</p>`;
        } else if (item.type === 'buy') {
            extraInfo = `<p class="compra-duracion">Acceso ilimitado</p>`;
        }

        return `
            <div class="cart-item" role="listitem">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>${item.typeName} - ${formatPrice(item.price)}</p>
                    ${extraInfo}
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus" data-index="${index}" aria-label="Reducir cantidad">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}" aria-label="Aumentar cantidad">+</button>
                        <button class="remove-btn" data-index="${index}" aria-label="Eliminar del carrito">Eliminar</button>
                    </div>
                </div>
                <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `;
    }).join('');

      // Botones funcionales
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            updateQuantity(index, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const item = cart[index];
        
            // Solo permitir sumar si es un alquiler
            if (item.type === 'rent') {
                updateQuantity(index, 1);
            } else {
                showFeedback(`"${item.title}" ya fue comprado. No necesitas más de una copia.`, 'info');
            }
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeItem(btn.dataset.index);
        });
    });
    
    }


    function updateQuantity(index, change) {
    const item = cart[index];

    // No permitir aumentar la cantidad si es una compra
    if (item.type === 'buy' && change === 1) {
        showFeedback(`Ya compraste "${item.title}". Solo se necesita una copia.`, 'info');
        return;
    }

    // Aplicar el cambio de cantidad
    item.quantity += change;

    // Si llega a 0, eliminar del carrito
    if (item.quantity < 1) {
        cart.splice(index, 1);
        showFeedback('Item eliminado del carrito', 'info');
    }

    saveCart();
    updateCartDisplay();
}


    function removeItem(index) {
        const removedItem = cart.splice(index, 1)[0];
        saveCart();
        updateCartDisplay();
        showFeedback(`"${removedItem.title}" eliminada del carrito`, 'info');
    }

    function updateCartDisplay() {
        renderCartItems();
        updateCartCount();
        updateCartTotals();
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        elements.cartCount.textContent = count;
        elements.cartCount.setAttribute('aria-label', `${count} items en el carrito`);
    }

    function updateCartTotals() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountAmount = discountApplied ? subtotal * (discountPercentage / 100) : 0;
        const total = subtotal - discountAmount;
        
        elements.cartSubtotal.textContent = formatPrice(subtotal);
        elements.cartTotal.textContent = formatPrice(total);
        
        if (discountApplied) {
            elements.discountSection.style.display = 'flex';
            elements.cartDiscount.textContent = `-${formatPrice(discountAmount)}`;
        } else {
            elements.discountSection.style.display = 'none';
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function applyPromoCode() {
        const promoCode = elements.promoCodeInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            showFeedback('Ingresa un código promocional', 'error');
            return;
        }
        
        if (validPromoCodes[promoCode]) {
            discountApplied = true;
            discountPercentage = validPromoCodes[promoCode];
            updateCartTotals();
            showFeedback(`¡Descuento del ${discountPercentage}% aplicado!`, 'success');
            elements.promoCodeInput.disabled = true;
            elements.applyPromoBtn.disabled = true;
        } else {
            showFeedback('Código promocional no válido', 'error');
        }
    }

    function checkout() {
        if (cart.length === 0) {
            showFeedback('Tu carrito está vacío', 'error');
            return;
        }
        
        // Simular procesamiento de pago
        showFeedback('¡Compra realizada con éxito!', 'success');
        
        // Crear recibo
        const receipt = {
            date: new Date(),
            items: [...cart],
            subtotal: parseFloat(elements.cartSubtotal.textContent),
            discount: discountApplied ? parseFloat(elements.cartDiscount.textContent) * -1 : 0,
            total: parseFloat(elements.cartTotal.textContent)
        };
        
        // Guardar historial
        const history = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
        history.push(receipt);
        localStorage.setItem('purchaseHistory', JSON.stringify(history));
        
        // Resetear carrito
        resetCart();
    }

    function resetCart() {
        cart = [];
        saveCart();
        updateCartDisplay();
        toggleCartModal();
        discountApplied = false;
        elements.promoCodeInput.value = '';
        elements.promoCodeInput.disabled = false;
        elements.applyPromoBtn.disabled = false;
    }

    function toggleCartModal() {
        const isOpen = elements.cartModal.classList.toggle('show');
        
        // Actualizar atributos ARIA
        elements.cartModal.setAttribute('aria-hidden', !isOpen);
        elements.cartModal.setAttribute('aria-modal', isOpen);
        elements.cartToggle.setAttribute('aria-expanded', isOpen);
        
        // Manejar el scroll del body
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        
        // Enfocar el modal cuando se abre
        if (isOpen) {
            renderCartItems();
            updateCartTotals();
            elements.cartModal.focus();
        }
    }

    function filterMovies() {
        const genre = elements.genreFilter.value;
        const type = elements.typeFilter.value;
        
        let filteredMovies = [...moviesData];
        
        // Filtrar por género
        if (genre !== 'all') {
            filteredMovies = filteredMovies.filter(movie => movie.genre === genre);
        }
        
        // Filtrar por tipo
        if (type !== 'all') {
            filteredMovies = filteredMovies.filter(movie => movie.type === type || movie.type === 'both');
        }
        
        renderMovies(filteredMovies);
    }

    function sortMovies() {
        const sortBy = elements.sortFilter.value;
        if (sortBy === 'default') return;
        
        let sortedMovies = [...moviesData];
        
        switch (sortBy) {
            case 'price-asc':
                sortedMovies.sort((a, b) => (a.price || a.rentPrice) - (b.price || b.rentPrice));
                break;
            case 'price-desc':
                sortedMovies.sort((a, b) => (b.price || b.rentPrice) - (a.price || a.rentPrice));
                break;
            case 'title-asc':
                sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        
        renderMovies(sortedMovies);
    }

    function searchMovies() {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        renderMovies(moviesData);
        return;
    }

    // Actualizar la URL con el término de búsqueda
    history.pushState(null, null, `#movies?q=${encodeURIComponent(searchTerm)}`);

    // Filtrar películas por título o género
    const filteredMovies = moviesData.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        getGenreName(movie.genre).toLowerCase().includes(searchTerm)
    );

    // Hacer scroll hacia la sección de películas
    const moviesSection = document.getElementById('movies');
    if (moviesSection) {
        moviesSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Si no se encontraron resultados
    if (filteredMovies.length === 0) {
        showFeedback('No se encontró ninguna película con ese nombre. Intenta con otra.', 'info');
        return; // No borra la grilla existente
    }

    // Si hay resultados, renderizarlos
    renderMovies(filteredMovies);
    }


    function showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `notification ${type} show`;
        feedback.setAttribute('role', 'alert');
        feedback.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            ${message}
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 500);
        }, 3000);
    }

    async function handleContactForm(e) {
        e.preventDefault();
        
        // Validar formulario
        if (!validateForm()) {
            return;
        }
        
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            // Mostrar estado de carga
            form.querySelector('button[type="submit"]').disabled = true;
            
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showFeedback('Mensaje enviado con éxito', 'success');
                form.reset();
                elements.formMessage.textContent = '';
            } else {
                throw new Error('Error en el envío');
            }
        } catch (error) {
            showFeedback('Error al enviar el mensaje', 'error');
            elements.formMessage.textContent = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.';
            elements.formMessage.className = 'error';
            elements.formMessage.style.display = 'block';
        } finally {
            form.querySelector('button[type="submit"]').disabled = false;
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Validar nombre
        if (!validateName()) isValid = false;
        
        // Validar email
        if (!validateEmail()) isValid = false;
        
        // Validar mensaje
        if (!validateMessage()) isValid = false;
        
        return isValid;
    }

    function validateName() {
        const name = elements.contactForm.name.value.trim();
        const errorElement = document.getElementById('name-error');
        
        if (name.length < 2) {
            errorElement.textContent = 'El nombre debe tener al menos 2 caracteres';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    function validateEmail() {
        const email = elements.contactForm.email.value.trim();
        const errorElement = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            errorElement.textContent = 'Por favor, ingresa un email válido';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    function validateMessage() {
        const message = elements.contactForm.message.value.trim();
        const errorElement = document.getElementById('message-error');
        
        if (message.length < 10) {
            errorElement.textContent = 'El mensaje debe tener al menos 10 caracteres';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }
});