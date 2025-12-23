// Video autoplay detection and play button functionality
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.querySelector('.hero-video');
    const videoOverlay = document.querySelector('.video-overlay');
    
    if (heroVideo && videoOverlay) {
        // Create play button element
        const playButton = document.createElement('button');
        playButton.classList.add('video-play-button');
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        playButton.style.display = 'none'; // Hide by default
        videoOverlay.appendChild(playButton);
        
        // Check if video is actually playing
        setTimeout(() => {
            // If the video is paused after the autoplay attempt, show the play button
            if (heroVideo.paused) {
                playButton.style.display = 'flex';
            }
        }, 500);
        
        // Play button click handler
        playButton.addEventListener('click', () => {
            heroVideo.play()
                .then(() => {
                    playButton.style.display = 'none';
                })
                .catch(error => {
                    console.error('Video play failed:', error);
                    // Keep the button visible if play fails
                });
        });
    }
}); 