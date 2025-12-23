from flask import Flask, render_template, request, jsonify
from movie_recommender import MovieRecommender
import os
import logging
import json
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

# Initialize the movie recommender
recommender = MovieRecommender()

# Gmail API setup
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Get an authorized Gmail API service instance."""
    creds = None
    
    # Load credentials from token.json if it exists
    if os.path.exists('token.json'):
        with open('token.json', 'r') as token:
            creds = Credentials.from_authorized_user_info(json.load(token))
    
    # If credentials don't exist or are invalid, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            # Use a fixed port (8080) instead of dynamic port selection
            creds = flow.run_local_server(port=5555)
        
        # Save credentials for next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    return build('gmail', 'v1', credentials=creds)

def create_message(sender_email, recipient_email, subject, message_text, sender_name=""):
    """Create a message for an email."""
    message = MIMEText(message_text)
    message['to'] = recipient_email
    message['from'] = f"{sender_name} <{sender_email}>" if sender_name else sender_email
    message['subject'] = subject
    
    # Encode the message in base64
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def send_message(service, user_id, message):
    """Send an email message."""
    try:
        message = service.users().messages().send(userId=user_id, body=message).execute()
        app.logger.debug(f"Message sent. Message ID: {message['id']}")
        return message
    except Exception as e:
        app.logger.error(f"An error occurred while sending the email: {str(e)}")
        raise

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/developer/<dev_name>')
def developer_profile(dev_name):
    """Render a developer's profile page"""
    # Map URL-friendly names to their display names and roles
    developer_info = {
        'abhishek': {
            'name': 'Abhishek T.V.S',
            'role': 'ML Engineer',
            'about': 'Specialized in machine learning algorithms and recommendation systems. Responsible for developing and fine-tuning the movie recommendation engine that powers CineMatch.',
            'image': 'ml engineer.jpg',
            'email': 'venkatsaiabhishek665@gmail.com',
            'linkedin': 'https://www.linkedin.com/in/turamalla-venkata-sai-abhishek-0292782ab/'
        },
        'karthikesh': {
            'name': 'Karthikesh B',
            'role': 'Frontend Developer',
            'about': 'Expert in creating responsive and intuitive user interfaces. Designed and implemented the frontend of CineMatch with a focus on user experience and visual appeal.',
            'image': 'frontend developer.jpg',
            'email': 'karthikeshchary04@gmail.com',
            'linkedin': 'https://www.linkedin.com/in/karthikesh-chary-194633270/'
        },
        'darahas': {
            'name': 'Sai Darahas B',
            'role': 'Backend Developer',
            'about': 'Skilled in server-side programming and API development. Built the backend infrastructure of CineMatch, ensuring fast and reliable data processing and integration.',
            'image': 'backend developer.jpg',
            'email': 'darahas102@gmail.com',
            'linkedin': 'https://www.linkedin.com/in/saidarahasbilla/'
        },
        'naresh': {
            'name': 'Naresh Chandra P',
            'role': 'Data Engineer',
            'about': 'Specialized in data processing and database management. Responsible for curating and maintaining the movie database that drives CineMatch\'s recommendations.',
            'image': 'data engineer.jpg',
            'email': 'nareshchandra0658@gmail.com',
            'linkedin': 'https://www.linkedin.com/in/naresh-chandra-puru-b842222b3/'
        }
    }
    
    # Check if the developer exists in our mapping
    if dev_name.lower() not in developer_info:
        return render_template('404.html'), 404
    
    # Get the developer's information
    dev_data = developer_info[dev_name.lower()]
    
    return render_template('developer_profile.html', developer=dev_data)

@app.route('/recommend', methods=['POST'])
def recommend():
    """Return movie recommendations based on the input movie"""
    data = request.get_json()
    movie_title = data.get('movie', '')
    app.logger.debug(f"Recommendation requested for movie: {movie_title}")
    
    try:
        # Get a list of all movies and find the closest match (case insensitive)
        all_movies = recommender.get_all_movies()
        exact_matches = [m for m in all_movies if m.lower() == movie_title.lower()]
        
        if exact_matches:
            # Use the exact match with the correct case
            movie_title = exact_matches[0]
            app.logger.debug(f"Using exact match: {movie_title}")
        else:
            close_matches = [m for m in all_movies if movie_title.lower() in m.lower()]
            if close_matches:
                # Use the first close match
                movie_title = close_matches[0]
                app.logger.debug(f"Using close match: {movie_title}")
        
        recommendations = recommender.recommend(movie_title)
        app.logger.debug(f"Found {len(recommendations)} recommendations")
        return jsonify({'success': True, 'recommendations': recommendations})
    except Exception as e:
        app.logger.error(f"Error recommending movies: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/movies')
def get_movies():
    """Return a list of all movies"""
    movies = recommender.get_all_movies()
    app.logger.debug(f"Returning {len(movies)} movies")
    return jsonify({'movies': movies})

@app.route('/contact', methods=['POST'])
def contact():
    """Process contact form submission and send email"""
    try:
        # Get form data
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        
        app.logger.debug(f"Contact form submission from {name} ({email})")
        
        # Validate form data
        if not all([name, email, message]):
            return jsonify({'success': False, 'error': 'All fields are required'})
        
        # Get Gmail service
        service = get_gmail_service()
        YOUR_EMAIL = "darahas102@gmail.com"  # Replace with your email address
        
        # 1. Send the contact message to yourself
        subject = f"CineMatch Contact: Message from {name}"
        email_content = f"""
Name: {name}
Email: {email}

Message:
{message}
"""
        email_message = create_message(
            sender_email=YOUR_EMAIL,
            recipient_email=YOUR_EMAIL,
            subject=subject,
            message_text=email_content,
            sender_name=name
        )
        send_message(service, 'me', email_message)
        
        # 2. Send thank you email to the user
        thank_you_subject = "Thank you for contacting CineMatch"
        thank_you_content = f"""
Dear {name},

Thank you for messaging CineMatch! :)

We've received your message and will get back to you as soon as possible.

Best regards,
The CineMatch Team
"""
        thank_you_message = create_message(
            sender_email=YOUR_EMAIL,
            recipient_email=email,
            subject=thank_you_subject,
            message_text=thank_you_content,
            sender_name="CineMatch Team"
        )
        send_message(service, 'me', thank_you_message)
        
        return jsonify({'success': True, 'message': 'Your message has been sent!'})
    
    except Exception as e:
        app.logger.error(f"Error sending contact form: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True) 