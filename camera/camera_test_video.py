import cv2
import torch
import time
from flask import Flask, render_template, Response, jsonify
from models.common import DetectMultiBackend
from utils.general import check_img_size, non_max_suppression, scale_boxes
from utils.torch_utils import select_device
from utils.plots import Annotator, colors  # Adjust based on actual location in your environment
import os  # Import os module for file operations
import firebase_admin
from firebase_admin import credentials, storage

app = Flask(__name__)


cred = credentials.Certificate("static/spectre-8f79c-firebase-adminsdk-pcu99-db7dd868e1.json")  # Replace with your service account key path
firebase_admin.initialize_app(cred, {
    'storageBucket': 'spectre-8f79c.appspot.com'  # Replace with your Firebase project ID
})

bucket = storage.bucket()

# YOLOv5 settings
weights = "best.pt"  # Path to your YOLOv5 model weights
device = select_device('')  # Automatically select device (CPU or GPU)
model = DetectMultiBackend(weights, device=device)
stride, names, pt = model.stride, model.names, model.pt
imgsz = [640, 640]
imgsz = check_img_size(imgsz, s=stride)

# Variable to track detection status
person_detected = False  # Use a boolean for detecting person

# Use MP4 file for video input instead of a camera
video_file_path = "alvin2.mp4"  # Set your MP4 file path here

def generate_frames():
    global person_detected
    cap = cv2.VideoCapture(video_file_path)  # Open video capture for the given MP4 file
    recording = False
    video_writer = None
    output_filename = None
    last_detection_time = None  # To track when the last detection occurred
    max_inactivity_time = 10  # Time to continue recording after last detection (in seconds)
    
    fps = cap.get(cv2.CAP_PROP_FPS)  # Get frame rate from the video file
    pre_record_buffer = int(fps * 5)  # 5 seconds buffer (dynamic based on FPS)
    frame_buffer = []  # Buffer to hold frames before the person appears
    video_saved = False  # Track if a person was detected in the video

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        else:
            frame = cv2.resize(frame, (imgsz[0], imgsz[1])) 
            # Preprocess the frame for YOLOv5 input
            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = torch.from_numpy(img).to(device)
            img = img.float() / 255.0  # Normalize to [0, 1]
            img = img.permute(2, 0, 1).unsqueeze(0)  # Change shape to [1, 3, height, width]

            # Run inference with the YOLOv5 model
            pred = model(img)
            pred = non_max_suppression(pred, conf_thres=0.30, iou_thres=0.45)

            annotator = Annotator(frame, line_width=1)
            person_detected = False  # Reset detection flag for this video

            for det in pred:
                if len(det):
                    det[:, :4] = scale_boxes(img.shape[2:], det[:, :4], frame.shape).round()
                    for *xyxy, conf, cls in reversed(det):
                        if names[int(cls)] == "Shoplift":  # Change "Shoplift" to "person"
                            person_detected = True  # Set flag if a person is detected
                            video_saved = True  # Mark that a person was detected in this video
                        annotator.box_label(xyxy, f'{names[int(cls)]} {conf:.2f}', color=colors(int(cls), True))

            # If a person is detected and recording hasn't started, start recording
            if person_detected and not recording:
                recording = True
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                output_filename = f"shoplift_detected_{timestamp}.mp4"
                video_writer = cv2.VideoWriter(output_filename, cv2.VideoWriter_fourcc(*'mp4v'), 16.5, (frame.shape[1], frame.shape[0]))
                last_detection_time = time.time()  # Start the detection timer
                print(f"Started recording: {output_filename}")
                # Write buffered frames for the 5-second pre-record buffer
                for buffered_frame in frame_buffer:
                    video_writer.write(buffered_frame)

            # If a person is not detected but recording, check inactivity
            if not person_detected and recording:
                # If the person was last detected more than max_inactivity_time seconds ago, stop recording
                if time.time() - last_detection_time >= max_inactivity_time:
                    recording = False
                    video_writer.release()
                    print(f"Stopped recording: {output_filename}")
            
            # If a person is detected, reset the inactivity timer
            if person_detected:
                last_detection_time = time.time()

            if output_filename:
                    upload_to_firebase(output_filename)
                    video_saved = True  

            # Buffer frames for pre-record period before person appears
            if len(frame_buffer) < pre_record_buffer:
                frame_buffer.append(frame)
            else:
                frame_buffer.pop(0)
            
            # Write the current frame to the video if recording
            if recording and video_writer is not None:
                video_writer.write(frame)

            # Convert frame to JPEG and yield it for streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    # Release resources when done
    if video_writer:
        video_writer.release()

    # If no person was detected throughout the entire video, discard the recording
    if not video_saved and output_filename:
        os.remove(output_filename)
        print(f"Video discarded as no person was detected: {output_filename}")
    
    cap.release()

def upload_to_firebase(file_path):
    """
    Uploads a file to Firebase Storage.
    """
    try:
        blob = bucket.blob(f"records/{os.path.basename(file_path)}")  # Save under "videos/" in Firebase Storage
        blob.upload_from_filename(file_path)
        blob.make_public()  # Optional: make the file publicly accessible
        print(f"File uploaded to Firebase: {blob.public_url}")
        os.remove(file_path)  # Remove local file after upload
    except Exception as e:
        print(f"Failed to upload {file_path} to Firebase: {e}")



# Routes for each camera
@app.route('/')
def index():
    return render_template('index.html')

@app.route("/client")
def client():   
    return render_template("client.html")

@app.route('/index')
def index_home():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route("/login")
def login():   
    return render_template("login.html")

@app.route("/about-us")
def aboutus():   
    return render_template("about-us.html")

@app.route("/contact_us")
def contactus():   
    return render_template("contact_us.html")

@app.route("/solutions/shoplifting")
def shoplift():   
    return render_template("solutions/shoplifting.html")

@app.route("/solutions/robbery")
def robbery():   
    return render_template("solutions/robbery.html")

@app.route("/solutions/humandetection")
def humandetect():   
    return render_template("solutions/humandetection.html")

@app.route("/privacy_policy")
def privacypolicy():   
    return render_template("privacy_policy.html")

@app.route("/create-new-password")
def createNewpass():   
    return render_template("create-new-password.html")

@app.route("/code-verification")
def codeVerify():   
    return render_template("code-verification.html")

@app.route("/add-account")
def addAccount():   
    return render_template("add-account.html") # Ensure this file exists in the templates folder

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detection_status')
def detection_status():
    try:
        # If any camera detects a person, return True
        return jsonify({'person_detected': person_detected})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Run Flask on port 5000
