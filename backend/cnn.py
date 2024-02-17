import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torch.nn.functional as F
import pandas as pd
from sklearn.model_selection import train_test_split
import os
from tqdm import tqdm
tqdm.pandas()
import numpy as np

class SudokuDataset(Dataset):
    def __init__(self, csv_file):
        print('Loading dataset...')
        skip = range(1, 1500001) # Value not updated for next run
        self.data_frame = pd.read_csv(csv_file, skiprows=skip, nrows=100000, dtype=str)
        self.data_frame['puzzle'] = [list(map(int, list(row))) for row in tqdm(self.data_frame['puzzle'], desc="Loading puzzles")]
        self.data_frame['solution'] = [list(map(int, list(row))) for row in tqdm(self.data_frame['solution'], desc="Loading solutions")]

    def __len__(self):
        return len(self.data_frame)

    def __getitem__(self, idx):
        puzzle_str, solution_str = self.data_frame.iloc[idx]
        puzzle = torch.tensor([int(i) for i in puzzle_str], dtype=torch.float32).view(1, 9, 9)
        solution = torch.tensor([int(i) for i in solution_str], dtype=torch.long).view(9, 9) - 1
        return puzzle, solution

dataset = SudokuDataset('./data/sudoku.csv')
train_set, val_set = train_test_split(dataset, test_size=0.1, random_state=42)
train_loader = DataLoader(train_set, batch_size=128, shuffle=True, num_workers=11)
val_loader = DataLoader(val_set, batch_size=128, shuffle=False, num_workers=11)


class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 64, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(64)
        self.conv2 = nn.Conv2d(64, 128, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(128)
        self.conv3 = nn.Conv2d(128, 128, 3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(128 * 9 * 9, 81 * 9)

    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        x = self.dropout(x)
        x = x.view(-1, 128 * 9 * 9)
        x = self.fc1(x)
        return x.view(-1, 81, 9)

model = CNN().cuda()


def train(model, train_loader, val_loader, epochs=10, patience=3):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=2, factor=0.5, min_lr=1e-6, verbose=True)
    model_path = 'sudoku.pth'
    epochs_no_improve = 0
    best_loss = np.inf

    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
        model.eval()
        print('Loaded existing model.')

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        progress_bar = tqdm(enumerate(train_loader), total=len(train_loader), desc=f"Epoch {epoch+1}")
        for i, (puzzles, solutions) in progress_bar:
            puzzles = puzzles.cuda()
            solutions = solutions.cuda()
            optimizer.zero_grad()
            outputs = model(puzzles)
            loss = criterion(outputs.view(-1, 9), solutions.view(-1))
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1)
            optimizer.step()
            running_loss += loss.item()
            progress_bar.set_description(f"Epoch {epoch+1}, Loss: {running_loss / (i + 1)}")

        avg_train_loss = running_loss / len(train_loader.dataset)
        val_loss = validate(model, val_loader, criterion)
        print(f'Epoch {epoch + 1}, Train Loss: {avg_train_loss:.4f}, Validation Loss: {val_loss:.4f}')
        scheduler.step(val_loss)

        if val_loss < best_loss:
            best_loss = val_loss
            epochs_no_improve = 0
            torch.save(model.state_dict(), model_path)
            print(f'Model improved and saved to {model_path}. Best Validation Loss: {best_loss:.4f}')
        else:
            epochs_no_improve += 1
            print(f'No improvement in Validation Loss for {epochs_no_improve} epochs.')

        if epochs_no_improve >= patience:
            print('Early stopping!')
            break

def validate(model, val_loader, criterion):
    model.eval()
    val_loss = 0.0
    with torch.no_grad():
        for puzzles, solutions in val_loader:
            puzzles = puzzles.cuda()
            solutions = solutions.cuda()
            outputs = model(puzzles)
            loss = criterion(outputs.view(-1, 9), solutions.view(-1))
            val_loss += loss.item() * puzzles.size(0)

    return val_loss / len(val_loader.dataset)

if __name__ == "__main__":
    train(model, train_loader, val_loader, epochs=10000)