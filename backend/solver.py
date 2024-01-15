def is_valid(board, row, col, num):
    for x in range(9):
        if board[row][x] == num or board[x][col] == num or board[3 * (row // 3) + x // 3][3 * (col // 3) + x % 3] == num:
            return False
    return True

def validate_board(board):
    for i in range(9):
        row = set()
        column = set()
        box = set()
        for j in range(9):
            if board[i][j] == 0:
                continue

            if board[i][j] in row:
                return False
            row.add(board[i][j])

            if board[j][i] in column:
                return False
            column.add(board[j][i])

            box_row = 3 * (i // 3)
            box_col = 3 * (j // 3)
            box_num = board[box_row + j // 3][box_col + j % 3]
            if box_num in box:
                return False
            box.add(box_num)
    return True

def solve_sudoku(board):
    if not validate_board(board):
        return False

    empty = find_empty(board)
    if not empty:
        return True
    row, col = empty

    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num
            if solve_sudoku(board):
                return True
            board[row][col] = 0

    return False

def find_empty(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:
                return i, j
    return None
