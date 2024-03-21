from flask import Flask, request, jsonify
from services.solver import solve_sudoku


def create_app():
    app = Flask(__name__)

    @app.route('/solve', methods=['POST'])
    def solve_sudoku_endpoint():
        data = request.get_json()

        if not data or 'puzzle' not in data:
            return jsonify({"error": "Request must contain a 'puzzle' field."}), 400

        puzzle = data.get('puzzle')

        if not isinstance(puzzle, list) or len(puzzle) != 9 or not all(len(row) == 9 for row in puzzle):
            return jsonify({"error": "Puzzle must be a 9x9 grid."}), 400

        # Validate puzzle contents
        for row in puzzle:
            if not all(isinstance(num, int) and 0 <= num <= 9 for num in row):
                return jsonify({"error": "Puzzle can only contain integers between 0 and 9."}), 400


        # Attempt to solve the puzzle
        if solve_sudoku(puzzle):
            return jsonify({"solution": puzzle})
        else:
            return jsonify({"error": "Puzzle could not be solved."}), 422

    return app
