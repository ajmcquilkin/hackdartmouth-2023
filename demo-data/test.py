import os
import requests
import csv
import datetime
import random
import time
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Set up the OpenAI API credentials
openai_api_endpoint = 'http://localhost:3000/read'

# Set up the folder path for the .txt files
folder_path = './govt'


# Initialize an incremental ID counter
id_counter = 0

# Initialize a results list to hold the ID, result string pairs
results = []

# Loop through all .txt files in the folder
for file_name in os.listdir(folder_path):
    if file_name.endswith('.txt'):
        # Read in the contents of the file
        with open(os.path.join(folder_path, file_name), 'r') as f:
            file_content = f.read()
        # Make a POST request to the OpenAI API
        headers = {'Content-Type': 'application/json',}
        data = {
            'blob': file_content
        }
        try:
            response = requests.post(openai_api_endpoint, headers=headers, json=data).json()
        except:
            print('Error: ', file_name)
            continue
        print('date', response['timestamp'])
        # print('essence', response['metadata'])

        time.sleep(2)