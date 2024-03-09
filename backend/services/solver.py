def find_empty_location(arr, l):
    for row in range(9):
        for col in range(9):
            if arr[row][col] == 0:
                l[0], l[1] = row, col
                return True
    return False

def used_in_row(arr, row, num):
    for col in range(9):
        if arr[row][col] == num:
            return True
    return False

def used_in_col(arr, col, num):
    for row in range(9):
        if arr[row][col] == num:
            return True
    return False

def used_in_box(arr, box_start_row, box_start_col, num):
    for row in range(3):
        for col in range(3):
            if arr[row + box_start_row][col + box_start_col] == num:
                return True
    return False

def is_safe(arr, row, col, num):
    return not used_in_row(arr, row, num) and not used_in_col(arr, col, num) and not used_in_box(arr, row - row % 3, col - col % 3, num)

def solve_sudoku(arr):
    l = [0, 0]
    if not find_empty_location(arr, l):
        return True  # Success!

    row, col = l

    for num in range(1, 10):
        if is_safe(arr, row, col, num):
            arr[row][col] = num

            if solve_sudoku(arr):
                return True

            arr[row][col] = 0  # Backtrack

    return False  # Triggers backtracking

if __name__ == '__main__':
    # Define a Sudoku puzzle (0's represent empty cells)
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]

    # Attempt to solve the puzzle and print the result
    if solve_sudoku(puzzle):
        for row in puzzle:
            print(row)
    else:
        print("No solution exists.")

