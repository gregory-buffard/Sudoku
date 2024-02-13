from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from solver import solve_sudoku
import cv2
import numpy as np
from torchvision import transforms
from io import BytesIO
from PIL import Image
import os
from ml import Net
import torch

app = Flask(__name__)
CORS(app)
model_path = "sudoku_vision_cnn.pth"
model = Net()
model.load_state_dict(torch.load(model_path))
model.eval()

transform = transforms.Compose([
    transforms.Resize((640, 480)),
    transforms.ToTensor()
])

def process_image(image):
    image = Image.open(BytesIO(image)).convert('L')
    image = transform(image)
    image = image.unsqueeze(0)
    return image

def predict(image):
    with torch.no_grad():
        output = model(image)
        output = output.squeeze(0).argmax(dim=1).view(9, 9)
    return output.numpy()

@app.route('/solve-image', methods=['POST'])
def solve_from_image():
    if 'image' not in request.files:
        return jsonify({"error": "Aucun fichier."}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Aucun fichier selectioné."}), 400
    image = process_image(file.read())
    grid = predict(image)

    if solve_sudoku(grid):
        return jsonify({"solution": grid.tolist()}), 200
    else:
        return jsonify({"solution": grid.tolist()}), 200

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    board = data.get('board')
    if board and solve_sudoku(board):
        return jsonify({"solution": board}), 200
    else:
        return jsonify({"error": "Pas de solution."}), 400

if __name__ == '__main__':
    app.run(debug=True)
