import cv2
import pytesseract
import os
import numpy as np

def process_and_extract_sudoku(image_path):
    print("Loading model...")
    # Configure pytesseract to use the bundled tesseract executable
    pytesseract.pytesseract.tesseract_cmd = os.path.join(os.path.dirname(__file__), 'binaries', 'tesseract.exe')
    os.environ['TESSDATA_PREFIX'] = os.path.join(os.path.dirname(__file__), 'binaries/tessdata')

    # Load image
    print("Loading image...")
    image = cv2.imread(image_path)

    print('Processing to image generalization...')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite('output/gray.png', gray)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 19, 5)
    #gaussian blur
    thresh = cv2.GaussianBlur(thresh, (5, 5), 0)
    cv2.imwrite('output/thresh.png', thresh)
    kernel = np.array([[0., 1., 0.], [1., 1., 1.], [0., 1., 0.]], np.uint8)
    dilate = cv2.dilate(thresh, kernel)
    erode = cv2.erode(dilate, kernel)
    cv2.imwrite('output/erode.png', erode)

    lines = lines = cv2.HoughLinesP(erode, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
    line_img = np.zeros_like(image)
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            cv2.line(line_img, (x1, y1), (x2, y2), (255, 255, 255), 2)
    cv2.imwrite('output/lines.png', line_img)


    # Find contours and get the largest one (Sudoku grid)
    print("Finding contours...")
    contours, _ = cv2.findContours(cv2.cvtColor(line_img, cv2.COLOR_BGR2GRAY), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest_area = 0
    largest_contour = None

    for contour in contours:
        area = cv2.contourArea(contour)
        if area > largest_area:
            largest_area = area
            largest_contour = contour

    if largest_contour is None:
        print("Could not find the Sudoku grid contour.")
        return None

    # Get the bounding box of the largest contour
    x, y, w, h = cv2.boundingRect(largest_contour)
    grid = erode[y:y+h, x:x+w]
    cv2.imwrite('output/grid.png', grid)

    custom_config = r'--oem 3 --psm 6 outputbase digits'
    text = pytesseract.image_to_string(grid, config=custom_config)

    # Divide the grid into 9x9 cells and perform OCR on each cell
    print("Evaluating each cell...")
    board = []
    rows = text.split('\n')
    for i, row in enumerate(rows):
        if i < 9:
            digits = [int(char) if char.isdigit() else 0 for char in row[:9]]
            # Ensure each row has 9 elements, pad with 0 if necessary
            digits += [0] * (9 - len(digits))
            board.append(digits)

    # Ensure the board has 9 rows, pad with rows of 0s if necessary
    while len(board) < 9:
        board.append([0] * 9)

    print(board)
    return board

if __name__ == '__main__':
    process_and_extract_sudoku('sudoku.jpg')