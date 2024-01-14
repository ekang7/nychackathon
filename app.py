from flask import Flask, request, jsonify, send_from_directory, send_file
import os
import openai
import requests
from openai import OpenAI

app = Flask(__name__)

api_key = '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'
client = OpenAI(api_key = api_key)

openai.api_key = api_key

# Serve the index.html file from the 'public' folder
@app.route('/', methods=['GET'])
def serve_index():
    return send_file('public/index.html')

# Serve the style.css file from the 'public' folder
@app.route('/style.css')
def serve_css():
    return send_from_directory('public', 'style.css')

# Serve the script.js file from the 'public' folder
@app.route('/script.js')
def serve_js():
    return send_from_directory('public', 'script.js')

@app.route('/new_node', methods=['POST'])
def new_node():
    if request.is_json:
        data = request.get_json()
        root = data.get('root', '')
        existing_nodes = data.get('existingNodes', '')
        prompt = "What is a subconcept for " + root + " that is not one of " + existing_nodes + "? Just give the 1-word concise name of the subconcept."
        node = chat_with_gpt(prompt)
        return jsonify({"newNode": node}), 200
    else:
        return jsonify({"error": "No JSON data received"}), 400
    
@app.route('/get_description', methods=['POST'])
def get_description():
    if request.is_json:
        data = request.get_json()
        root = data.get('root', '')
        node = data.get('node', '')
        prompt = "What is a concise description for " + node + " related " + root + "? Give no more than 3 sentences and list 2 resources/links."
        description = chat_with_gpt(prompt)
        return jsonify({"description": description}), 200
    else:
        return jsonify({"error": "No JSON data received"}), 400

# seen = "Breed, Behavior, Diet, Training, Health".split()

# prompt1 = "What are 5 subconcepts for AI? Just give comma delimited answers."
# prompt2 = "Give a 3 sentence summary on concept: " + "Natural Language Processing" + " related to " + "AI. Link trustworthy resources"
# prompt3 = "What are 5 subconcepts for " + "diet" + " related to " + "dog" + "? Just give comma delimited answers."
# prompt4 = "What are 5 subconcepts for " + "diet" + " related to " + "dog" + "? Just give comma delimited answers."

def generate_response(prompt):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        stop = None,
        temperature=0.5,
    )
    return response.choices[0].message.content

def chat_with_gpt(prompt):
    prompt = f"User: {prompt}\nAssistant:"
    response = generate_response(prompt)
    return response

# if __name__ == '__main__':
#     root = "AI"
#     existing_nodes = "Machine Learning, Natural Language Processing, Robotics, Computer Vision, Expert Systems"
#     prompt = "What is a subconcept for " + root + " that is not one of " + existing_nodes + "? Just give the concise name of the subconcept."
#     node = "Knowledge Representation"
#     prompt = "What is a concise description for " + node + " related " + root + "? Give no more than 3 sentences and list 2 resources/links."
#     print(chat_with_gpt(prompt))

if __name__ == '__main__':
    app.run(debug=True)