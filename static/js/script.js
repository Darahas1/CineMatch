document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const movieInput = document.getElementById('movie-input');
    const recommendBtn = document.getElementById('recommend-btn');
    const recommendationsList = document.getElementById('recommendations-list');
    const errorMessage = document.getElementById('error-message');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    const sliderContainer = document.querySelector('.slider-container');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const contactForm = document.getElementById('contact-form');
    const heroVideo = document.querySelector('.hero-video');
    const suggestionsContainer = document.getElementById('suggestions-container');
    
    let moviesData = [];
    let sliderPosition = 0;
    let cardWidth = 260; // Width of a single card including margin
    let currentFocus = -1; // Track keyboard navigation in suggestions

    // Add global error handler for images
    document.querySelectorAll('img.movie-poster').forEach(img => {
        img.addEventListener('error', function() {
            handleImageError(this);
        });
    });
    
    // Function to handle image loading errors
    function handleImageError(imgElement) {
        const movieTitle = imgElement.alt || 'Movie';
        const encodedTitle = encodeURIComponent(movieTitle);
        imgElement.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="#222"><rect width="300" height="450" fill="#333"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#e50914">${movieTitle}</text></svg>`)}`;
        imgElement.style.objectFit = 'cover';
    }

    // Handle video loading
    if (heroVideo) {
        // Show a loading state if video takes too long
        const videoLoadTimeout = setTimeout(() => {
            heroVideo.style.opacity = '1';
        }, 1000);
        
        heroVideo.addEventListener('canplay', function() {
            clearTimeout(videoLoadTimeout);
            heroVideo.style.opacity = '1';
            heroVideo.play().catch(err => {
                console.log('Auto-play prevented:', err);
            });
        });
        
        // Handle video end (if it's not a looping video)
        heroVideo.addEventListener('ended', function() {
            if (!heroVideo.loop) {
                heroVideo.currentTime = 0;
                heroVideo.play().catch(err => console.log('Replay prevented:', err));
            }
        });
    }

    // Sample movies data for fallback
    const sampleMoviesData = [
        "The Shawshank Redemption", "The Godfather", "The Dark Knight", 
        "Pulp Fiction", "The Matrix", "Forrest Gump", "Fight Club", 
        "Inception", "The Lord of the Rings", "Interstellar", "Dune: Part Two",
        "The Fall Guy", "Peaky Blinders", "Spider-Man: No Way Home",
        "Avatar", "Titanic", "Gladiator", "The Avengers", "Jurassic Park"
    ];

    // Fetch all movies
    fetch('/movies')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched movies data:", data);
            if (data.movies && Array.isArray(data.movies) && data.movies.length > 0) {
                moviesData = data.movies;
                console.log("Movies data loaded successfully, count:", moviesData.length);
            } else {
                // Use sample data if server returns empty array
                moviesData = sampleMoviesData;
                console.log('Using sample movies data');
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            // Use sample data on error
            moviesData = sampleMoviesData;
            console.log('Using sample movies data due to fetch error');
        });

    // Navbar scroll effect with throttling
    let lastScrollTime = 0;
    window.addEventListener('scroll', function() {
        const now = Date.now();
        if (now - lastScrollTime > 50) { // Throttle to 50ms
            lastScrollTime = now;
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        }
    });

    // Mobile menu toggle
    burger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        burger.classList.toggle('toggle');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            burger.classList.remove('toggle');
        });
    });

    // Slider controls
    if (prevBtn && nextBtn && sliderContainer) {
        // Update card width dynamically
        function updateCardWidth() {
            const cards = document.querySelectorAll('.slider-container .movie-card');
            if (cards.length) {
                const card = cards[0];
                const style = getComputedStyle(card);
                const width = card.offsetWidth;
                const marginRight = parseInt(style.marginRight) || 0;
                const marginLeft = parseInt(style.marginLeft) || 0;
                cardWidth = width + marginRight + marginLeft + 20; // 20px is the gap
            }
        }

        window.addEventListener('resize', updateCardWidth);
        updateCardWidth();

        // Slider navigation
        nextBtn.addEventListener('click', function() {
            const cardCount = document.querySelectorAll('.slider-container .movie-card').length;
            const containerWidth = sliderContainer.parentElement.offsetWidth;
            const visibleCards = Math.floor(containerWidth / cardWidth);
            const maxPosition = (cardCount - visibleCards) * cardWidth;
            
            if (sliderPosition < maxPosition) {
                sliderPosition += cardWidth;
                sliderContainer.style.transform = `translateX(-${sliderPosition}px)`;
            }
        });

        prevBtn.addEventListener('click', function() {
            if (sliderPosition > 0) {
                sliderPosition -= cardWidth;
                sliderContainer.style.transform = `translateX(-${sliderPosition}px)`;
            }
        });
    }

    // Auto-suggestions functionality for movie input
    movieInput.addEventListener('input', function() {
        const inputValue = this.value.trim();
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        currentFocus = -1;
        
        console.log("Input value:", inputValue);
        console.log("Movies data loaded:", Array.isArray(moviesData) ? moviesData.length : "not an array");
        
        if (inputValue.length < 2) return;
        
        // If no movies data, use sample data
        if (!Array.isArray(moviesData) || moviesData.length === 0) {
            console.log("No movies data available, using sample data");
            moviesData = sampleMoviesData;
        }
        
        // Filter movies based on input
        const filteredMovies = moviesData.filter(movie => 
            typeof movie === 'string' && movie.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions
        
        console.log("Filtered movies:", filteredMovies.length);
        
        if (filteredMovies.length > 0) {
            suggestionsContainer.style.display = 'block';
            console.log("Showing suggestions container");
            
            filteredMovies.forEach(movie => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                
                // Highlight the matching part
                const index = movie.toLowerCase().indexOf(inputValue.toLowerCase());
                if (index >= 0) {
                    suggestionItem.innerHTML = movie.substring(0, index) + 
                        '<span class="suggestion-highlight">' + 
                        movie.substring(index, index + inputValue.length) + 
                        '</span>' + 
                        movie.substring(index + inputValue.length);
                } else {
                    suggestionItem.textContent = movie;
                }
                
                // Click event for suggestion
                suggestionItem.addEventListener('click', function() {
                    movieInput.value = movie;
                    suggestionsContainer.style.display = 'none';
                });
                
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            console.log("No matching movies found");
        }
    });
    
    // Handle keyboard navigation for suggestions
    movieInput.addEventListener('keydown', function(e) {
        const suggestionItems = suggestionsContainer.getElementsByClassName('suggestion-item');
        if (suggestionItems.length === 0) return;
        
        // Down arrow
        if (e.key === 'ArrowDown') {
            currentFocus++;
            addActive(suggestionItems);
            e.preventDefault(); // Prevent cursor from moving
        } 
        // Up arrow
        else if (e.key === 'ArrowUp') {
            currentFocus--;
            addActive(suggestionItems);
            e.preventDefault(); // Prevent cursor from moving
        } 
        // Enter
        else if (e.key === 'Enter' && currentFocus > -1) {
            if (suggestionItems[currentFocus]) {
                movieInput.value = suggestionItems[currentFocus].textContent;
                suggestionsContainer.style.display = 'none';
                e.preventDefault(); // Prevent form submission
            }
        }
    });
    
    // Helper function to add active class to the selected suggestion
    function addActive(items) {
        if (!items) return;
        
        // Remove active class from all items
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        
        // Adjust focus if out of bounds
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        
        // Add active class to current focus
        if (items[currentFocus]) {
            items[currentFocus].classList.add('active');
        }
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== movieInput && e.target !== suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Get recommendations when button is clicked
    recommendBtn.addEventListener('click', getRecommendations);

    // Also get recommendations when Enter is pressed in the input field
    movieInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && currentFocus === -1) {
            getRecommendations();
        }
    });

    // Handle contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Send data to the server
            fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: name,
                    email: email,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    submitBtn.textContent = 'Message Sent!';
                    submitBtn.style.backgroundColor = '#4CAF50';
                    
                    // Reset form after delay
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    // Show error message
                    submitBtn.textContent = 'Error!';
                    submitBtn.style.backgroundColor = '#e74c3c';
                    alert(data.error || 'Failed to send message. Please try again.');
                    
                    // Reset button after delay
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.textContent = 'Error!';
                submitBtn.style.backgroundColor = '#e74c3c';
                alert('Failed to send message. Please try again.');
                
                // Reset button after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Adjust for navbar height
                        behavior: 'smooth'
                    });
                    
                    // If this is the search icon, focus the search input
                    if (targetId === '#search-section' || targetId === '#') {
                        e.preventDefault(); // Prevent default href behavior
                        document.getElementById('movie-input').focus();
                    }
                }
            }
        });
    });

    function getRecommendations() {
        const movie = movieInput.value.trim();
        
        if (!movie) {
            showError('Please enter a movie title');
            return;
        }
        
        // Show loading state
        recommendationsList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Finding recommendations for "${movie}"...</p>
            </div>
        `;
        
        // Clear previous error
        errorMessage.innerHTML = '';
        
        // Create sample recommendations in case API fails
        const sampleRecommendations = [
            {
                title: "Inception",
                poster_path: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
            },
            {
                title: "Interstellar",
                poster_path: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"
            },
            {
                title: "The Matrix",
                poster_path: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"
            },
            {
                title: "The Dark Knight",
                poster_path: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
            },
            {
                title: "Pulp Fiction",
                poster_path: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"
            }
        ];
        
        // Call server API to get recommendations
        fetch('/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie: movie })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recommendations && data.recommendations.length > 0) {
                displayRecommendations(data.recommendations);
            } else {
                console.log('Using sample recommendations due to empty server response');
                displayRecommendations(sampleRecommendations);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('Using sample recommendations due to error');
            displayRecommendations(sampleRecommendations);
        });
    }

    function displayRecommendations(recommendations) {
        recommendationsList.innerHTML = '';
        errorMessage.innerHTML = '';
        
        if (!recommendations || recommendations.length === 0) {
            showError('No recommendations found. Please try another movie.');
            return;
        }
        
        recommendations.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            
            const posterContainer = document.createElement('div');
            posterContainer.classList.add('movie-poster-container');
            
            const poster = document.createElement('img');
            poster.classList.add('movie-poster');
            poster.alt = movie.title;
            poster.loading = 'lazy';
            
            // Add error handling for the poster
            poster.onerror = function() {
                console.error(`Failed to load poster for ${movie.title}`);
                this.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="#222"><rect width="300" height="450" fill="#333"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#e50914">${movie.title}</text></svg>`)}`;
                this.style.objectFit = 'cover';
            };
            
            // Set the poster source
            if (movie.poster_path) {
                poster.src = movie.poster_path;
            } else {
                // Use fallback if no poster path
                poster.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="#222"><rect width="300" height="450" fill="#333"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#e50914">${movie.title}</text></svg>`)}`;
            }
            
            const overlay = document.createElement('div');
            overlay.classList.add('movie-overlay');
            
            const details = document.createElement('div');
            details.classList.add('movie-details');
            
            const similarity = document.createElement('p');
            similarity.classList.add('movie-similarity');
            similarity.textContent = `Similarity: ${(movie.similarity_score * 100).toFixed(1)}%`;
            
            details.appendChild(similarity);
            overlay.appendChild(details);
            posterContainer.appendChild(poster);
            posterContainer.appendChild(overlay);
            
            const title = document.createElement('h3');
            title.classList.add('movie-title');
            title.textContent = movie.title;
            
            movieCard.appendChild(posterContainer);
            movieCard.appendChild(title);
            
            recommendationsList.appendChild(movieCard);
        });
        
        // Scroll to recommendations
        recommendationsList.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        recommendationsList.innerHTML = '';
    }

    // Add animation to elements when they scroll into view
    const animateOnScroll = function() {
        const sections = document.querySelectorAll('.movie-section, .developers-section, .contact-section');
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.85) {
                section.classList.add('animated');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run on initial load

    // Add click handlers to all existing movie titles in the page
    function addClickToMovieTitles() {
        const existingMovieTitles = document.querySelectorAll('.movie-title');
        existingMovieTitles.forEach(title => {
            if (!title.classList.contains('movie-title-clickable')) {
                title.classList.add('movie-title-clickable');
                title.addEventListener('click', function() {
                    const movieName = title.textContent.trim();
                    const searchQuery = encodeURIComponent("Watch " + movieName + " online");
                    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                });
            }
        });
    }
    
    // Run initially
    addClickToMovieTitles();
    
    // Also add click handlers after the page has fully loaded
    window.addEventListener('load', addClickToMovieTitles);
}); 