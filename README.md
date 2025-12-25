<div align="center">
  <img src="static/img/logo.png" alt="CineMatch Logo" width="300" height="auto" />
  <h1>CineMatch: Customized Movie Recommendations</h1>
  
  <p>
    <b>An intelligent recommendation engine powered by content-based filtering and semantic search.</b>
  </p>

  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3.8+-A71D31?style=for-the-badge&logo=python&logoColor=F1F0CC" alt="Python" />
  </a>
  <a href="https://flask.palletsprojects.com/">
    <img src="https://img.shields.io/badge/Flask-Backend-3F0D12?style=for-the-badge&logo=flask&logoColor=D5BF86" alt="Flask" />
  </a>
  <a href="https://scikit-learn.org/">
    <img src="https://img.shields.io/badge/Scikit_Learn-ML-8D775F?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit Learn" />
  </a>
  <a href="https://pandas.pydata.org/">
    <img src="https://img.shields.io/badge/Pandas-Data-D5BF86?style=for-the-badge&logo=pandas&logoColor=3F0D12" alt="Pandas" />
  </a>
  <a href="https://developer.themoviedb.org/docs">
    <img src="https://img.shields.io/badge/TMDB-API-A71D31?style=for-the-badge&logo=themoviedb&logoColor=F1F0CC" alt="TMDB" />
  </a>
</div>

<br />

---

## Overview

**CineMatch** is a sophisticated movie recommendation system designed to help users discover their next favorite film. Unlike simple genre filters, CineMatch uses **content-based filtering** to analyze the DNA of a movie—its plot, cast, crew, and keywords.

The application features a distinct **Cinematic UI** (utilizing a deep crimson and gold palette) and a smart autocomplete system that understands semantic similarity, ensuring you find relevant movies even if you don't know the exact title.

## Key Features

* **Smart Autocomplete:** Real-time suggestions that find both exact matches and semantically related titles as you type.
* **Precision Filtering:** Uses Cosine Similarity algorithms to recommend 5 movies based on plot, cast, and director.
* **Cinematic UI:** A responsive interface built with a rich color palette (`#A71D31` Red & `#D5BF86` Gold) for a premium look.
* **Integrated Contact:** Built-in email functionality using Google API for direct user feedback.
* **Rich Metadata:** Dynamically fetches high-quality movie posters from the TMDB API.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Flask | Lightweight web server and routing |
| **Machine Learning** | Scikit-learn | TF-IDF Vectorization & Cosine Similarity |
| **Data Processing** | Pandas / NumPy | Data manipulation and matrix operations |
| **Frontend** | HTML5 / JS / CSS3 | Responsive layout and AJAX interactions |
| **External API** | TMDB API | Fetching posters and movie metadata |
| **Communication** | Gmail API | Handling contact form submissions |

---

## How It Works

CineMatch uses a multi-step pipeline to generate recommendations:

1.  **Data Analysis:** The system ingests the TMDB 5000 dataset, extracting key features (Genres, Keywords, Cast, Director).
2.  **Vectorization:** Text data is processed using Natural Language Processing (NLP) techniques.
3.  **Similarity Matrix:** A cosine similarity matrix is calculated to quantify the relationship between every pair of movies.
4.  **Retrieval:** When a user selects a movie, the system retrieves the top 5 vectors closest to the selection.

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Darahas1/CineMatch.git  
```

### 2. Set Up Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Data Configuration
Download the dataset files from Kaggle and place them in the data/ folder:

> TMDB 5000 Movies

> TMDB 5000 Credits

### 5. Run the Application
```bash
python app.py
```

(Default) Access the app at: http://127.0.0.1:5000/


### Project Structure

```
movie-recommender/
├── app.py                 # Flask App & Routes
├── movie_recommender.py   # ML Recommendation Engine
├── requirements.txt       # Dependencies
├── data/                  # Dataset Directory
│   ├── tmdb_5000_movies.csv
│   └── tmdb_5000_credits.csv
├── static/                # Assets (CSS, JS, Images)
├── templates/             # HTML Templates
└── README.md              # Documentation
```

### Future Enhancements

* __User Accounts__: Personalized history and "Watch Later" lists.

* __Streaming Availability__: Integration with JustWatch API to show where to stream.

* __Advanced Filters__: Filter recommendations by Year, Language, or Runtime.

* __Mobile App__: A React Native version for mobile users.


### License

This project is licensed under the MIT [License](https://github.com/Darahas1/CineMatch/blob/main/LICENSE) - see the LICENSE file for details.


### Acknowledgments

* Data provided by The Movie Database (TMDB).
* UI inspired by modern streaming platforms.


<div align="center"> <sub>Built with ❤️ by Sai Darahas</sub> </div>