import pandas as pd
from flask import Flask, request, jsonify
import random
import re
import traceback
import json
import csv
import os
from itertools import product

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Data Loading and Column Standardization ---
def load_data(file_path='dataset.xlsx'):
    """Load and standardize the dataset."""
    if not os.path.exists(file_path):
        print(f"Error: The file '{file_path}' was not found.")
        return pd.DataFrame()
        
    try:
        # Load Excel file
        excel_data = pd.ExcelFile(file_path)
        
        # Parse first sheet
        df = excel_data.parse(excel_data.sheet_names[0])
        
        if df.empty:
            print("Warning: Dataset is empty")
            return pd.DataFrame()
            
        # Standardize column names
        original_columns = df.columns.tolist()
        df.columns = [re.sub(r'[^a-zA-Z0-9]+', '_', str(col)).lower().strip('_') for col in original_columns]
        
        # Fill NaN values with empty string for string operations
        string_columns = df.select_dtypes(include=['object']).columns
        df[string_columns] = df[string_columns].fillna('')
        
        print(f"Dataset loaded successfully with {len(df)} rows.")
        return df
        
    except Exception as e:
        print(f"Error loading dataset: {str(e)}")
        return pd.DataFrame()

# Load dataset
rule_data = load_data()

# --- Helper Functions ---
def split_and_strip(s):
    if not isinstance(s, str) or not s.strip(): return []
    return [x.strip() for x in s.split(',') if x.strip()]

def find_diverse_outfits(pools, existing_outfits, num_needed, rejection_set):
    """Intelligently finds diverse outfits by gradually relaxing criteria."""
    recommendations = list(existing_outfits)
    seen_outfits = {tuple(rec) for rec in recommendations}

    # Try to find outfits with decreasing levels of required difference
    for required_diff_count in [4, 3, 2, 1]:
        if len(recommendations) >= 3: break
        print(f"Seeking outfits with at least {required_diff_count} different attributes...")
        
        for _ in range(50):
            if len(recommendations) >= 3: break
            new_outfit = tuple(random.choice(pool) for pool in pools.values())
            
            if new_outfit in seen_outfits or new_outfit in rejection_set: continue

            is_diverse_enough = True
            if recommendations:
                for existing_outfit in recommendations:
                    diff_count = sum(1 for a, b in zip(new_outfit, existing_outfit) if a != b)
                    if diff_count < required_diff_count:
                        is_diverse_enough = False
                        break
            
            if is_diverse_enough:
                recommendations.append(new_outfit)
                seen_outfits.add(new_outfit)

    # Final fallback: if still not enough, just add any unique outfits
    if len(recommendations) < 3:
        print("Diversity criteria not met, filling with any unique outfits...")
        for _ in range(100): # More attempts for the final fill
            if len(recommendations) >= 3: break
            new_outfit = tuple(random.choice(pool) for pool in pools.values())
            if new_outfit not in seen_outfits:
                recommendations.append(new_outfit)
                seen_outfits.add(new_outfit)

    return recommendations

def max_distinct_outfits(all_outfits, max_outfits=3, existing_outfits=None):
    """Robustly finds distinct outfits, perfect for fallback tiers."""
    recommendations = list(existing_outfits) if existing_outfits is not None else []
    # Correctly handle that items in recommendations can be lists or tuples
    seen_outfits = {tuple(item) for item in recommendations}

    random.shuffle(all_outfits)

    for outfit in all_outfits:
        if len(recommendations) >= max_outfits:
            break
        # Ensure the outfit to be checked is a tuple
        outfit_tuple = tuple(outfit)
        if outfit_tuple not in seen_outfits:
            recommendations.append(outfit) # Append original format
            seen_outfits.add(outfit_tuple)

    return recommendations

# --- Core Recommendation Logic (Creative & Guaranteed) ---
FEEDBACK_FILE = 'user_feedback.csv'
OUTFIT_FIELDS = ["Dress Type", "Dress Color", "Dress Fabric/Texture", "Shoes Type", "Shoes Color", "Upper Layer", "Upper Layer Color", "image_url"]

def get_recommendations(current_temp: str, gender: str, event: str, outfit: str, time_of_day: str) -> list[dict]:
    # Validate gender input strictly
    valid_genders = {'male', 'female'}
    gender = gender.lower() if gender else ''
    if gender not in valid_genders:
        print(f"Error: Invalid gender '{gender}'. Must be 'male' or 'female'.")
        return []
    # --- Reinforcement Learning: Load rejected outfits --- #
    rejection_set = set()
    if os.path.exists(FEEDBACK_FILE):
        try:
            feedback_df = pd.read_csv(FEEDBACK_FILE)
            if not feedback_df.empty and 'feedback_type' in feedback_df.columns:
                rejected_df = feedback_df[feedback_df['feedback_type'] == 'rejected']
                # Create a tuple of all fields except the last one (feedback_type)
                for _, row in rejected_df.iterrows():
                    outfit_tuple = tuple(row[field] for field in OUTFIT_FIELDS)
                    rejection_set.add(outfit_tuple)
                print(f"Loaded {len(rejection_set)} rejected outfits for filtering.")
        except Exception as e:
            print(f"[WARNING] Could not load feedback file: {e}")
    if rule_data.empty or gender is None:
        return []

    # --- CRITICAL: The Gender Wall ---
    # Strict gender validation and filtering
    if rule_data.empty:
        print("Error: Empty dataset")
        return []

    # Convert gender to lowercase for case-insensitive comparison
    gender = gender.lower()
    
    # Filter dataset strictly by gender
    gender_specific_data = rule_data[
        rule_data['gender'].str.lower().str.strip().str.contains(gender, na=False)
    ].copy()
    
    # Strict validation of gender-specific data
    if gender_specific_data.empty:
        print(f"CRITICAL: No data found for gender '{gender}'. Cannot proceed.")
        return []

    # Double-check for any cross-gender contamination
    invalid_gender_data = gender_specific_data[
        gender_specific_data['gender'].str.lower().str.strip() != gender
    ]
    if not invalid_gender_data.empty:
        print(f"WARNING: Found {len(invalid_gender_data)} rows with incorrect gender data")
        gender_specific_data = gender_specific_data.drop(invalid_gender_data.index)
        if gender_specific_data.empty:
            print("CRITICAL: All data removed due to gender validation")
            return []

    # Parse temperature
    try:
        # Handle numeric input
        if isinstance(current_temp, (int, float)):
            temp = float(current_temp)
        # Handle string input
        else:
            match = re.search(r'(-?\d+(\.\d+)?)', str(current_temp))
            if not match:
                print(f"Warning: Could not parse temperature '{current_temp}', defaulting to 25")
                temp = 25
            else:
                temp = float(match.group(0))
        
        # Clamp temperature between 0 and 45
        temp = max(0, min(45, temp))
        
        # Determine weather range
        if 0 <= temp <= 10: weather_range = "0-10"
        elif 11 <= temp <= 20: weather_range = "10-20"
        elif 21 <= temp <= 30: weather_range = "20-30"
        elif 31 <= temp <= 40: weather_range = "30-40"
        else: weather_range = "41+"
            
    except Exception as e:
        print(f"Warning: Temperature parsing failed: {str(e)}, defaulting to 20-30 range")
        weather_range = "20-30"

    print(f"\n--- Starting Recommendation Generation for: Gender='{gender}', Event='{event}', Outfit='{outfit}', Time='{time_of_day}', Weather='{weather_range}' ---")

    def generate_outfits_from_rows(df):
        all_outfits = []
        for _, row in df.iterrows():
            # Ensure all required fields are present, defaulting to 'N/A'
            items = [
                split_and_strip(row.get('dress_type')) or ['N/A'],
                split_and_strip(row.get('dress_color')) or ['N/A'],
                split_and_strip(row.get('dress_fabric_texture')) or ['N/A'],
                split_and_strip(row.get('shoes_type')) or ['N/A'],
                split_and_strip(row.get('shoes_color')) or ['N/A'],
                split_and_strip(row.get('upper_layer')) or ['N/A'],
                split_and_strip(row.get('upper_layer_color')) or ['N/A']
            ]
            all_outfits.extend(list(product(*items)))
        # Return a list of unique tuples
        return list(set(all_outfits))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    # Tier 1: Perfect Match (within gender-specific data)
    print("--- Tier 1: Attempting Perfect Match ---")
    strict_rules = gender_specific_data[
        (gender_specific_data['weather_range'].astype(str).str.contains(weather_range, na=False)) &
        (gender_specific_data['event_name'].str.contains(event, na=False, case=False)) &
        (gender_specific_data['outfittype'].str.contains(outfit, na=False, case=False)) &
        (gender_specific_data['time'].str.contains(time_of_day, na=False, case=False))
    ].copy()
    recommendations = max_distinct_outfits(generate_outfits_from_rows(strict_rules))
    print(f"Found {len(recommendations)} distinct outfits in Tier 1.")

    # Tier 2: The Creative Stylist (Lightweight & Iterative)
    if len(recommendations) < 3:
        print(f"--- Tier 2: Activating Creative Stylist (Need {3 - len(recommendations)} more) ---")
        # Create pools of clothing items ONLY from gender-specific data
        # Extra validation to ensure we never mix genders
        dress_pool_df = gender_specific_data[
            (gender_specific_data['event_name'].str.contains(event, na=False, case=False)) &
            (gender_specific_data['gender'].str.lower().str.strip() == gender)
        ]
        weather_pool_df = gender_specific_data[
            (gender_specific_data['weather_range'].astype(str).str.contains(weather_range, na=False)) &
            (gender_specific_data['gender'].str.lower().str.strip() == gender)
        ]
        
        # Validate pools
        if dress_pool_df.empty: 
            print("WARNING: No matching dress pool found, using all gender-specific data")
            dress_pool_df = gender_specific_data
        if weather_pool_df.empty: 
            print("WARNING: No matching weather pool found, using all gender-specific data")
            weather_pool_df = gender_specific_data

        # Create lists of items to pick from with strict gender validation
        item_pools = {
            'dress_type': list(set(item for _, row in dress_pool_df.iterrows() 
                                if row['gender'].lower().strip() == gender 
                                for item in split_and_strip(row.get('dress_type')))) or ['N/A'],
            'dress_color': list(set(item for _, row in dress_pool_df.iterrows() 
                                  if row['gender'].lower().strip() == gender 
                                  for item in split_and_strip(row.get('dress_color')))) or ['N/A'],
            'fabric': list(set(item for _, row in dress_pool_df.iterrows() 
                             if row['gender'].lower().strip() == gender 
                             for item in split_and_strip(row.get('dress_fabric_texture')))) or ['N/A'],
            'shoes_type': list(set(item for _, row in weather_pool_df.iterrows() 
                                 if row['gender'].lower().strip() == gender 
                                 for item in split_and_strip(row.get('shoes_type')))) or ['N/A'],
            'shoes_color': list(set(item for _, row in weather_pool_df.iterrows() 
                                 if row['gender'].lower().strip() == gender 
                                 for item in split_and_strip(row.get('shoes_color')))) or ['N/A'],
            'upper_layer': list(set(item for _, row in weather_pool_df.iterrows() 
                                 if row['gender'].lower().strip() == gender 
                                 for item in split_and_strip(row.get('upper_layer')))) or ['N/A'],
            'upper_color': list(set(item for _, row in weather_pool_df.iterrows() 
                                 if row['gender'].lower().strip() == gender 
                                 for item in split_and_strip(row.get('upper_layer_color')))) or ['N/A']
        }

        # Use the new intelligent function to find diverse outfits
        recommendations = find_diverse_outfits(item_pools, recommendations, 3 - len(recommendations), rejection_set)
        print(f"Total recommendations after Tier 2: {len(recommendations)}")

    # Tier 3: Ultimate Fallback (if still needed)
    if len(recommendations) < 3:
        print(f"--- Tier 3: Activating Ultimate Fallback (Need {3 - len(recommendations)} more) ---")
        # Extra validation in fallback
        fallback_data = gender_specific_data[gender_specific_data['gender'].str.lower().str.strip() == gender]
        if fallback_data.empty:
            print("CRITICAL: No valid gender-specific data for fallback")
            return []
            
        fallback_outfits = generate_outfits_from_rows(fallback_data)
        # Use the robust max_distinct_outfits to fill up the list
        recommendations = max_distinct_outfits(fallback_outfits, max_outfits=3, existing_outfits=recommendations)
        print(f"Total recommendations after Fallback: {len(recommendations)}")

    # --- Image Fetching Helper ---
    def find_image_for_item(item_type, item_value):
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        if not os.path.exists(uploads_dir):
            return None
        # Search for image files that match item_value (case-insensitive, partial match)
        for fname in os.listdir(uploads_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')) and item_value and item_value.lower() in fname.lower():
                return f'/uploads/{fname}'
        return None

    # Final Formatting with images
    final_recommendations = []
    for item in recommendations:
        rec = {
            "Dress Type": item[0],
            "Dress Color": item[1],
            "Dress Fabric/Texture": item[2],
            "Shoes Type": item[3],
            "Shoes Color": item[4],
            "Upper Layer": item[5],
            "Upper Layer Color": item[6],
        }
        # Add image URLs for each item
        rec["Dress Type Image"] = find_image_for_item("dress_type", item[0])
        rec["Dress Color Image"] = find_image_for_item("dress_color", item[1])
        rec["Dress Fabric/Texture Image"] = find_image_for_item("dress_fabric_texture", item[2])
        rec["Shoes Type Image"] = find_image_for_item("shoes_type", item[3])
        rec["Shoes Color Image"] = find_image_for_item("shoes_color", item[4])
        rec["Upper Layer Image"] = find_image_for_item("upper_layer", item[5])
        rec["Upper Layer Color Image"] = find_image_for_item("upper_layer_color", item[6])
        final_recommendations.append(rec)
    return final_recommendations

# --- Feedback Endpoint ---
@app.route('/feedback', methods=['POST'])
def handle_feedback():
    data = request.get_json()
    outfit = data.get('outfit')
    feedback = data.get('feedback') # 'accepted' or 'rejected'

    if not outfit or not feedback:
        return jsonify({"error": "Missing outfit or feedback"}), 400

    try:
        # Ensure the file exists with a header
        if not os.path.exists(FEEDBACK_FILE):
            with open(FEEDBACK_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(OUTFIT_FIELDS + ['feedback_type'])

        with open(FEEDBACK_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # Ensure all fields are present in the row
            row = [outfit.get(field, 'N/A') for field in OUTFIT_FIELDS]
            row.append(feedback)
            writer.writerow(row)
        return jsonify({"status": "success", "message": "Feedback received"}), 200
    except Exception as e:
        print(f"[FEEDBACK_ERROR] {e}")
        traceback.print_exc()
        return jsonify({"error": "Could not process feedback"}), 500

# --- API Endpoints ---
@app.route('/')
def home():
    return jsonify({"status": "success", "message": "Groomify API is running.", "dataset_loaded": not rule_data.empty})

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    print(f"\n--- RAW REQUEST RECEIVED ---\n{json.dumps(data, indent=2)}")

    try:
        recommendations = get_recommendations(
            current_temp=data.get('weather'),
            gender=data.get('gender'),
            event=data.get('event'),
            outfit=data.get('outfit'),
            time_of_day=data.get('time')
        )
        print(f"--- RECOMMENDATION SENT: {len(recommendations)} items ---")
        return jsonify(recommendations)
    except Exception as e:
        print(f"[API_ERROR] An unexpected error occurred: {e}")
        traceback.print_exc()
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/save_recommendations', methods=['POST'])
def save_recommendations():
    """Save recommendations to CSV file."""
    # Validate request
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
        
    recommendations = request.json
    if not isinstance(recommendations, dict) or 'recommendations' not in recommendations:
        return jsonify({'error': 'Invalid request format. Must include recommendations field'}), 400
        
    data = recommendations['recommendations']
    if not data or not isinstance(data, list):
        return jsonify({'error': 'No valid recommendations provided'}), 400
        
    try:
        # Save to CSV
        file_path = 'saved_recommendations.csv'
        write_header = not os.path.exists(file_path) or os.stat(file_path).st_size == 0
        
        with open(file_path, 'a', newline='', encoding='utf-8') as f:
            if data:  # Check if we have any recommendations
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                if write_header:
                    writer.writeheader()
                for rec in data:
                    writer.writerow(rec)
                    
        return jsonify({'message': f'Successfully saved {len(data)} recommendations'}), 200
        
    except Exception as e:
        print(f"Error saving recommendations: {str(e)}")
        return jsonify({'error': 'Failed to save recommendations'}), 500

# --- Main Execution ---
if __name__ == '__main__':
    # --- Initialize Feedback File ---
    if not os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(OUTFIT_FIELDS + ['feedback_type'])
    print("Starting Flask server...")
    if not rule_data.empty:
        print(f"Dataset loaded successfully with {len(rule_data)} rows.")
    else:
        print("Warning: Dataset is empty or failed to load.")
    app.run(host='0.0.0.0', port=5000, debug=True)
