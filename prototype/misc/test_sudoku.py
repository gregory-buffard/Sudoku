import torch
import torch.nn.functional as F
from cnn import CNN
import numpy as np


def load_model(model_path):
    """
    Load the trained Sudoku solver model.
    """
    model = CNN().cuda()
    model.load_state_dict(torch.load(model_path))
    model.eval()
    return model


def process_puzzle(puzzle_str):
    """
    Convert the puzzle string to a tensor compatible with the model.
    """
    puzzle = [int(char) for char in puzzle_str]
    puzzle_tensor = torch.tensor(puzzle, dtype=torch.float32).view(1, 1, 9, 9).cuda()
    return puzzle_tensor


def solve_puzzle(model, puzzle_tensor):
    """
    Solve the Sudoku puzzle using the model.
    """
    with torch.no_grad():
        output = model(puzzle_tensor)
        output = F.softmax(output, dim=2)
        _, predicted = torch.max(output, 2)
    solved_puzzle = predicted.view(9, 9).cpu().numpy() + 1  # Add 1 to match Sudoku digits (1-9)
    return solved_puzzle


if __name__ == "__main__":
    # Example unsolved Sudoku puzzle (replace this with any puzzle you want to test)
    unsolved_puzzle = "000000000000900006000008030060000004002000301000740962080005000097023080056004017"

    model_path = 'sudoku.pth'
    model = load_model(model_path)

    puzzle_tensor = process_puzzle(unsolved_puzzle)
    solved_puzzle = solve_puzzle(model, puzzle_tensor)

    print("Original Puzzle:")
    print(np.reshape([int(char) for char in unsolved_puzzle], (9, 9)))
    print("\nSolved Puzzle:")
    print(solved_puzzle)
