from fastapi import FastAPI, HTTPException, APIRouter
import requests
from dotenv import load_dotenv
import os
router = APIRouter(tags =['maps'])



# Loading environment variables from .env file
load_dotenv()

# Reading the API key from the environment variables
MAPS_API_KEY = os.getenv("MAPS_API_KEY")

if not MAPS_API_KEY:
    raise Exception("Google Maps API key not found in environment variables.")

@router.get("/google-maps-api-key")
async def get_google_maps_api_key():
    return {"MAPS_API_KEY": MAPS_API_KEY}





@router.get("/nearest-hospitals/{lat}/{lng}")
def get_nearest_hospitals(lat: float, lng: float, radius: int = 5000):
    print(lat)
    print(lng)
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "hospital",
        "key": MAPS_API_KEY
    }

    response = requests.get(url, params=params)
    print(response)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    








    """
    
@router.get("/geocode")
async def geocode(address: str):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={MAPS_API_KEY}"
    response = requests.get(url)
    print("geo codeee: " + response)
    return response.json()

    
@router.get("/google-maps-api")
def get_google_maps_api():
    url = f"https://maps.googleapis.com/maps/api/js"
    params = {
        "key": MAPS_API_KEY,
        "v": "weekly",
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.text
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
"""