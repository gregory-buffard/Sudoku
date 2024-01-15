from flask import Flask, request, jsonify
from flask_cors import CORS
from solver import solve_sudoku

app = Flask(__name__)
CORS(app)

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
