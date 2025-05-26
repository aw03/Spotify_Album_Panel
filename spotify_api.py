import requests
from requests.auth import HTTPBasicAuth
import os
from dotenv import load_dotenv

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

token_header = None

def get_token_header():
    token_url = "https://accounts.spotify.com/api/token"
    token_headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    token_data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(
        token_url,
        headers=token_headers,
        data=token_data,
        auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    )

    # Get the JSON response
    response_json = response.json()

    # Extract the access token and token type
    access_token = response_json.get("access_token")
    token_type = response_json.get("token_type")

    headers = {
        "Authorization": f"{token_type} {access_token}"
    }

    return headers

def get_recently_played_tracks():
    try:
        response = requests.get(
            "https://api.spotify.com/v1/me/player/recently-played",
            headers=token_header)
    except:
        token_header = get_token_header()
        response = requests.get(
            "https://api.spotify.com/v1/me/player/recently-played",
            headers=token_header)
    return response

print(get_recently_played_tracks().reason)

