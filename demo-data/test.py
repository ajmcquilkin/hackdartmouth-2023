import os
import requests
import csv
import datetime
import random
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Set up the OpenAI API credentials
openai_api_key = os.getenv('OPENAI_SEC_KEY')
openai_api_endpoint = 'https://api.openai.com/v1/completions'

# Set up the folder path for the .txt files
folder_path = './demo-data/short'

# Set up the output CSV file path
output_file_path = './prompting/test-output.csv'

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

        prompt = '{}\n\n{}'.format('Today is {}. The user just read the article below. Generate list of keywords and metadata (such as author, time when published, current time, topics) around 256 characters in length.'.format(random_date_str = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 730)).date().isoformat()), file_content)

        # Make a POST request to the OpenAI API
        headers = {'Authorization': f'Bearer {openai_api_key}', 'Content-Type': 'application/json',}
        data = {
            'model': 'text-davinci-003',
            'prompt': prompt,
            'max_tokens': 256
        }
        response = requests.post(openai_api_endpoint, headers=headers, json=data)
        print(response)

        # Extract the result string from the response
        result_string = response.json()['choices'][0]['text']

        results.append((file_name, result_string))

# Write the results to a CSV file
with open(output_file_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'metadata'])
    writer.writerows(results)
