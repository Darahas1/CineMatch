import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import ast
import os
import requests
import json

class MovieRecommender:
    def __init__(self):
        # Path to data files - update these paths to your local file paths
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(current_dir, 'data')
        
        # In production, you should place the data files in the data directory
        movies_path = os.path.join(data_dir, 'tmdb_5000_movies.csv')
        credits_path = os.path.join(data_dir, 'tmdb_5000_credits.csv')
        
        # Load the dataset
        try:
            self.movies = pd.read_csv(movies_path)
            self.credits = pd.read_csv(credits_path)
            self.preprocess_data()
        except Exception as e:
            print(f"Error loading data: {e}")
            # For demo purposes, we'll create empty dataframes
            self.new = pd.DataFrame(columns=['movie_id', 'title', 'tags'])
            self.similarity = np.array([])
            
    def fetch_poster(self, movie_id):
        """Fetch movie poster from TMDB API with enhanced error handling"""
        try:
            # Log the attempt
            print(f"Attempting to fetch poster for movie ID: {movie_id}")
            
            # Construct API URL
            url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US"
            
            # Make the request with timeout
            response = requests.get(url, timeout=5)
            
            # Check if request was successful
            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                return None
            
            # Parse JSON response
            data = response.json()
            
            # Check if poster_path exists
            if not data.get('poster_path'):
                print(f"No poster path found for movie ID {movie_id}")
                return None
            
            # Construct full poster URL
            poster_path = data['poster_path']
            full_path = "https://image.tmdb.org/t/p/w500" + poster_path
            
            # Verify the URL is accessible
            poster_response = requests.head(full_path, timeout=5)
            if poster_response.status_code != 200:
                print(f"Poster URL not accessible: {full_path}")
                return None
            
            print(f"Successfully fetched poster for movie ID {movie_id}")
            return full_path
            
        except requests.exceptions.Timeout:
            print(f"Timeout while fetching poster for movie ID {movie_id}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Network error while fetching poster for movie ID {movie_id}: {str(e)}")
            return None
        except json.JSONDecodeError:
            print(f"Invalid JSON response for movie ID {movie_id}")
            return None
        except Exception as e:
            print(f"Unexpected error while fetching poster for movie ID {movie_id}: {str(e)}")
            return None
    
    def convert(self, text):
        """Convert string representation of list to actual list of names"""
        L = []
        for i in ast.literal_eval(text):
            L.append(i['name'])
        return L
    
    def convert_director(self, text):
        """Extract director's name from crew data"""
        L = []
        for i in ast.literal_eval(text):
            if i['job'] == 'Director':
                L.append(i['name'])
        return L
    
    def collapse(self, L):
        """Remove spaces from strings in a list"""
        if isinstance(L, str):
            L1 = []
            for i in L:
                L1.append(i.replace(" ", ""))
            return L1
        elif isinstance(L, (int, float)):
            return str(L)
        else:
            return L
    
    def preprocess_data(self):
        """Preprocess the movie data for recommendation using enhanced approach"""
        # Merge movies and credits on title
        self.movies = self.movies.merge(self.credits, on='title')
        
        # Check if poster_path exists, if not, add a dummy column
        if 'poster_path' not in self.movies.columns:
            print("poster_path column not found in dataset, using TMDB API to fetch posters")
            self.movies['poster_path'] = None
        
        # Select relevant columns
        self.movies = self.movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 
                                  'cast', 'crew', 'release_date', 'vote_count', 'poster_path']]
        
        # Remove rows with missing values in critical columns
        self.movies = self.movies.dropna(subset=['overview', 'genres', 'keywords', 'cast', 'crew'])
        
        # Convert string representations to lists
        self.movies['genres'] = self.movies['genres'].apply(self.convert)
        self.movies['keywords'] = self.movies['keywords'].apply(self.convert)
        self.movies['cast'] = self.movies['cast'].apply(self.convert)
        self.movies['cast'] = self.movies['cast'].apply(lambda x: x[0:3])  # Use only top 3 cast members
        self.movies['crew'] = self.movies['crew'].apply(self.convert_director)
        
        # Clean up strings by removing spaces (improves matching)
        self.movies['cast'] = self.movies['cast'].apply(self.collapse)
        self.movies['crew'] = self.movies['crew'].apply(self.collapse)
        self.movies['genres'] = self.movies['genres'].apply(self.collapse)
        self.movies['keywords'] = self.movies['keywords'].apply(self.collapse)
        
        # Convert date and vote count to string form for tagging
        self.movies['release_date'] = self.movies['release_date'].apply(self.collapse)
        self.movies['vote_count'] = self.movies['vote_count'].apply(self.collapse)
        
        # Convert overview to list of words
        self.movies['overview'] = self.movies['overview'].apply(lambda x: x.split())
        
        # Combine all features into tags
        self.movies['tags'] = self.movies['overview'] + self.movies['genres'] + \
                             self.movies['keywords'] + self.movies['cast'] + self.movies['crew']
        
        # Convert release_date and vote_count to lists before concatenating
        self.movies['release_date'] = self.movies['release_date'].apply(
            lambda x: [x] if isinstance(x, str) else x)
        self.movies['vote_count'] = self.movies['vote_count'].apply(
            lambda x: [x] if isinstance(x, str) else x)
        
        # Add release_date and vote_count to tags (optional, can improve relevance)
        self.movies['tags'] = self.movies['tags'] + self.movies['release_date'] + self.movies['vote_count']
        
        # Create a new dataframe with only the needed columns
        self.new = self.movies.drop(columns=['overview', 'genres', 'keywords', 'cast', 'crew', 
                                           'release_date', 'vote_count'])
        
        # Join the tags into a single string
        self.new['tags'] = self.new['tags'].apply(lambda x: " ".join(x))
        
        # Create vectors from tags
        cv = CountVectorizer(max_features=5000, stop_words='english')
        vectors = cv.fit_transform(self.new['tags']).toarray()
        
        # Calculate cosine similarity between movies
        self.similarity = cosine_similarity(vectors)
        
        print(f"Preprocessed {len(self.new)} movies and computed similarity matrix")
    
    def recommend(self, movie_title):
        """Recommend similar movies based on the given movie title"""
        try:
            # Find the index of the movie
            index = self.new[self.new['title'] == movie_title].index[0]
        except IndexError:
            raise ValueError(f"Movie '{movie_title}' not found in the dataset.")
        
        # Calculate similarity scores and get top 5 similar movies
        distances = sorted(list(enumerate(self.similarity[index])), reverse=True, key=lambda x: x[1])
        recommendations = []
        
        for i in distances[1:6]:  # Skip the first one as it's the movie itself
            # Convert NumPy int64 to standard Python int to make it JSON serializable
            movie_id = int(self.new.iloc[i[0]].movie_id)
            movie_data = {
                'title': self.new.iloc[i[0]].title,
                'movie_id': movie_id
            }
            
            # Add similarity score (could be useful for frontend)
            movie_data['similarity_score'] = float(i[1])
            
            # Fetch poster from TMDB API
            poster_url = self.fetch_poster(movie_id)
            if poster_url:
                movie_data['poster_path'] = poster_url
                
            recommendations.append(movie_data)
        
        return recommendations
    
    def get_all_movies(self):
        """Return a list of all movie titles"""
        try:
            return self.new['title'].tolist()
        except Exception as e:
            print(f"Error getting movie list: {e}")
            return []