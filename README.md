# CineMatch: Customized Movie Recommendation System

![CineMatch](static/img/logo.png)

## Overview

CineMatch is an intelligent movie recommendation system that uses advanced content-based filtering to suggest movies similar to your favorites. The application features an enhanced autocomplete function that suggests semantically related movies as you type, making it easier to discover new films you'll love.

## Key Features

- **Smart Autocomplete**: Get suggestions for both exact matches and semantically similar movies as you type
- **Personalized Recommendations**: Discover five movies similar to your selection based on content analysis
- **Beautiful Netflix-Inspired UI**: Enjoy a responsive, modern interface that works on all devices
- **Rich Movie Information**: View movie posters fetched from TMDB API
- **Contact Form**: Easily get in touch with the development team via integrated email functionality

## How It Works

CineMatch uses a sophisticated content-based filtering approach:

1. **Comprehensive Data Analysis**: Movies are analyzed based on:
   - Plot overview and themes
   - Genres and keywords
   - Cast members and director
   - Release date
   - Popularity metrics (vote count)

2. **Advanced Text Processing**: Features are processed using natural language techniques and vectorization

3. **Similarity Calculation**: Cosine similarity algorithm identifies movies with similar content profiles

4. **Enhanced Suggestion System**: The autocomplete feature combines exact text matching and semantic similarity to provide intelligent suggestions

## Setup Instructions

### Prerequisites
- Python 3.8+ installed
- Git (for cloning the repository)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movie-recommendation-system
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Data Setup:
   - Download the TMDB 5000 dataset files:
     - [tmdb_5000_movies.csv](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata?select=tmdb_5000_movies.csv)
     - [tmdb_5000_credits.csv](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata?select=tmdb_5000_credits.csv)
   - Place these files in the `data/` directory

5. Email Integration (Optional):
   - If you want to use the contact form functionality:
     - Create a Google Cloud Platform project
     - Enable the Gmail API
     - Download credentials.json to the project root
     - On first run, follow the authentication prompts

6. Run the application:
   ```bash
   python app.py
   ```

7. Access the application:
   ```
   http://127.0.0.1:5000/
   ```

## Technology Stack

### Backend
- **Flask**: Python web framework for serving the application
- **Pandas & NumPy**: Data manipulation and numerical operations
- **scikit-learn**: Machine learning for similarity calculations
- **Google API Client**: For email integration with the contact form

### Frontend
- **HTML5/CSS3**: Responsive layout with modern styling
- **JavaScript**: Dynamic interactions and AJAX requests
- **Fetch API**: Asynchronous data retrieval from the backend

### External Services
- **TMDB API**: For fetching movie posters and additional metadata

## Project Structure
```
movie-recommender/
│
├── app.py                 # Flask application with routes and email functionality
├── movie_recommender.py   # Core recommendation engine
├── requirements.txt       # Python dependencies
│
├── static/                # Static assets
│   ├── css/               # Stylesheet files
│   ├── js/                # JavaScript files
│   ├── images/            # Image assets
│   └── videos/            # Video content
│
├── templates/             # HTML templates
│   └── index.html         # Main application page
│
├── data/                  # Dataset files
│   ├── tmdb_5000_movies.csv
│   └── tmdb_5000_credits.csv
│
└── README.md              # Project documentation
```

## Future Enhancements

- User accounts and personalized recommendation history
- Advanced filtering options (by genre, year, rating)
- Integration with streaming service availability
- Mobile application version

## Acknowledgments

- Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Project inspired by content-based recommendation techniques
- Special thanks to the open-source community for machine learning tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback about this project, please use the contact form within the application or reach out through GitHub.

---

*Last updated: April 2025*

