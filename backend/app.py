from flask import Flask, request, jsonify, flash, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from solver import solve_sudoku
from image_processing import process_and_extract_sudoku
import os

app = Flask(__name__)
CORS(app)

@app.route('/solve-image', methods=['POST'])
def solve_from_image():
    if 'image' not in request.files:
        return jsonify({"error": "Aucun fichier."}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Aucun fichier selectioné."}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join('./images', filename)
    file.save(file_path)
    try:
        sudoku_board = process_and_extract_sudoku(file_path)
        if solve_sudoku(sudoku_board):
            return jsonify({"solution": sudoku_board})
        else:
            return jsonify({"solution": sudoku_board})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
