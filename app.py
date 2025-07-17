

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
from rembg import remove
from PIL import Image
from io import BytesIO
import base64
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Set up folders
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER


@app.route('/cartoonify', methods=['GET', 'POST'])
def upload_image():
    print("DEBUG: request.files:", request.files)
    print("DEBUG: request.form:", request.form)
    if request.method == 'GET':
        return jsonify({"message": "Use POST method to upload an image"}), 200

    # Try to get image from request.files (standard file upload)
    if 'image' in request.files:
        file = request.files['image']
        if not file.filename:
            return jsonify({"error": "No selected file"}), 400
        if not file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'webp')):
            return jsonify({"error": "Unsupported file type"}), 400
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        base64_cartoon = process_image(filepath)
        if not base64_cartoon:
            return jsonify({"error": "Failed to process image"}), 500
        print(f"Cartoonified Image Base64: {base64_cartoon[:100]}...")
        return jsonify({"cartoonImage": f"data:image/png;base64,{base64_cartoon}"})

    # Try to get image from request.form (base64 string, possible from web)
    elif 'image' in request.form:
        data = request.form['image']
        import base64
        from PIL import Image
        from io import BytesIO
        if data.startswith('data:image'):
            header, data = data.split(',', 1)
        try:
            image_data = base64.b64decode(data)
            image = Image.open(BytesIO(image_data))
            filename = 'web_upload.png'
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            image.save(filepath)
            base64_cartoon = process_image(filepath)
            if not base64_cartoon:
                return jsonify({"error": "Failed to process image"}), 500
            print(f"Cartoonified Image Base64: {base64_cartoon[:100]}...")
            return jsonify({"cartoonImage": f"data:image/png;base64,{base64_cartoon}"})
        except Exception as e:
            print(f"❌ Web upload decode error: {e}")
            return jsonify({"error": "Invalid image data"}), 400

    return jsonify({"error": "No file uploaded"}), 400


@app.route('/update_profile_image', methods=['POST'])
def update_profile_image():
    """Endpoint to update user's profile image (avatar). Accepts user_id/email and image (file or base64)."""
    user_id = request.form.get('user_id') or request.json.get('user_id') if request.is_json else None
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    # Try to get image from request.files (standard file upload)
    if 'image' in request.files:
        file = request.files['image']
        if not file.filename:
            return jsonify({'error': 'No selected file'}), 400
        if not file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'webp')):
            return jsonify({'error': 'Unsupported file type'}), 400
        filename = secure_filename(f"{user_id}_profile_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        image_url = f"/uploads/{filename}"
        return jsonify({'success': True, 'image_url': image_url}), 200

    # Try to get image from request.form (base64 string)
    elif 'image' in request.form:
        data = request.form['image']
        if data.startswith('data:image'):
            header, data = data.split(',', 1)
        try:
            image_data = base64.b64decode(data)
            image = Image.open(BytesIO(image_data))
            filename = secure_filename(f"{user_id}_profile.png")
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            image.save(filepath)
            image_url = f"/uploads/{filename}"
            return jsonify({'success': True, 'image_url': image_url}), 200
        except Exception as e:
            print(f"❌ Profile image decode error: {e}")
            return jsonify({'error': 'Invalid image data'}), 400

    return jsonify({'error': 'No image uploaded'}), 400


def process_image(image_path, crop_coords=None, avatar_size=(512, 512)):
    """Process the image: remove background and apply cartoon effect."""
    try:
        # Open and remove background
        with open(image_path, "rb") as img_file:
            input_image = img_file.read()
        removed_bg = remove(input_image)  # Remove background

        # Convert to PIL image
        if isinstance(removed_bg, bytes):
            image_no_bg = Image.open(BytesIO(removed_bg)).convert("RGBA")
        else:
            image_no_bg = Image.fromarray(removed_bg).convert("RGBA")

        # Crop if coordinates are provided
        if crop_coords:
            x, y, w, h = crop_coords
            img_width, img_height = image_no_bg.size

            x = max(0, min(x, img_width))
            y = max(0, min(y, img_height))
            w = max(1, min(w, img_width - x))
            h = max(1, min(h, img_height - y))

            image_no_bg = image_no_bg.crop((x, y, x + w, y + h))

        # Convert to OpenCV format
        image_rgba = np.array(image_no_bg)
        if image_rgba.shape[-1] == 4:
            image_rgb = cv2.cvtColor(image_rgba[:, :, :3], cv2.COLOR_RGBA2RGB)
        else:
            image_rgb = image_rgba

        # Apply cartoon effect
        gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
        edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
        edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
        cartoon = cv2.bitwise_and(image_rgb, edges_colored)

        # Ensure transparency is preserved
        alpha_channel = image_rgba[:, :, 3] if image_rgba.shape[-1] == 4 else np.ones_like(gray) * 255
        cartoon_rgba = np.dstack((cartoon, alpha_channel))

        # Convert back to PIL and resize
        final_avatar = Image.fromarray(cartoon_rgba, mode="RGBA")
        final_avatar = final_avatar.resize(avatar_size, Image.Resampling.LANCZOS)

        # Encode image to base64
        buffer = BytesIO()
        final_avatar.save(buffer, format="PNG")
        buffer.seek(0)
        base64_image = base64.b64encode(buffer.read()).decode('utf-8')

        return base64_image
    except Exception as e:
        print(f"❌ Processing Error: {e}")
        return None

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
