if __name__ == "__main__":
    import os
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    import cv2
    from torchvision import transforms
    from PIL import Image
    import numpy as np
    from ml import Net

    # Load the trained model
    net = Net()
    print(net)
    model_path = "sudoku_vision_cnn.pth"
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = Net()
    if os.path.isfile(model_path):
        print('Model found, loading model...')
        checkpoint = torch.load(model_path, map_location=device)
        print(checkpoint['state_dict'])
        model_state_dict = checkpoint['state_dict']
        print('Model loaded !')
        model.load_state_dict(model_state_dict)
        print('Model state dict loaded !')
        model.to(device)
    else:
        print("No model found")

    # Define a transform to normalize the image
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((640, 480)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])


    # Function to test the model on a single image
    def test_single_image(image_path, model):
        # Read the image
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply transformations
        img = transform(img)

        # Unsqueeze to add a batch dimension (B x C x H x W)
        img = img.unsqueeze(0)

        # Forward pass to get the output from the model
        with torch.no_grad():
            output = model(img)
            # The output will be (1, 81, 10), we need to convert this to the predicted digits
            _, predicted = torch.max(output.data, 2)
            predicted = predicted.squeeze().numpy().reshape((9, 9))
        return predicted


    # Test the model on a new image
    image_path = "sudoku.jpg"
    predicted_sudoku = test_single_image(image_path, model)
    print("Predicted Sudoku:")
    print(predicted_sudoku)