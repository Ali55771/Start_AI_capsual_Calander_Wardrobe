import pandas as pd

try:
    # Load the Excel file
    df = pd.read_excel('dataset.xlsx', sheet_name=0) # Read the first sheet
    
    # Print the first 15 rows to see the data structure and content
    print("--- First 15 Rows of dataset.xlsx ---")
    print(df.head(15).to_string())
    print("\n--- End of Data ---")
    
except FileNotFoundError:
    print("Error: 'dataset.xlsx' not found in the current directory.")
except Exception as e:
    print(f"An error occurred: {e}")
