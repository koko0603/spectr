import cv2
import torch
import time
from flask import Flask, render_template, Response, jsonify
from models.common import DetectMultiBackend
from utils.general import check_img_size, non_max_suppression, scale_boxes
from utils.torch_utils import select_device
from utils.plots import Annotator, colors
import os  # Import os module for file operations

app = Flask(__name__)

# YOLOv5 settings
weights = "yolov5m.pt"  # Path to your YOLOv5 model weights
device = select_device('')  # Automatically select device (CPU or GPU)
model = DetectMultiBackend(weights, device=device)
stride, names, pt = model.stride, model.names, model.pt
imgsz = [640, 640]
imgsz = check_img_size(imgsz, s=stride)

# Variable to track detection status
person_detected = [False] * 4 # Assume 4 cameras, adjust as needed

def generate_frames(camera_index):
    global person_detected
    cap = cv2.VideoCapture(camera_index)  # Open video capture for the given camera index
    recording = False
    video_writer = None
    output_filename = None
    last_detection_time = None  # To track when the last detection occurred
    max_inactivity_time = 5  # Time to continue recording after last detection (in seconds)

    fps = cap.get(cv2.CAP_PROP_FPS)  # Get frame rate from the video file
    pre_record_buffer = int(fps * 5)  # 5 seconds buffer (dynamic based on FPS)
    frame_buffer = []  # Buffer to hold frames before the person appears
    video_saved = False

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = torch.from_numpy(img).to(device)
            img = img.float() / 255.0
            img = img.permute(2, 0, 1).unsqueeze(0)

            pred = model(img)
            pred = non_max_suppression(pred, conf_thres=0.30, iou_thres=0.45)

            annotator = Annotator(frame, line_width=1)
            person_detected[camera_index] = False  # Reset detection flag for this camera
            
            for det in pred:
                if len(det):
                    det[:, :4] = scale_boxes(img.shape[2:], det[:, :4], frame.shape).round()
                    for *xyxy, conf, cls in reversed(det):
                        if names[int(cls)] == "person":
                            person_detected[camera_index] = True  # Set flag if a person is detected
                        annotator.box_label(xyxy, f'{names[int(cls)]} {conf:.2f}', color=colors(int(cls), True))

            # If a person is detected and recording hasn't started, start recording
            if person_detected[camera_index] and not recording:
                recording = True
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                output_filename = f"shoplift_detected_{camera_index}_{timestamp}.mp4"
                video_writer = cv2.VideoWriter(output_filename, cv2.VideoWriter_fourcc(*'mp4v'), 16, (frame.shape[1], frame.shape[0]))
                last_detection_time = time.time()  # Start the detection timer
                print(f"Started recording: {output_filename}")
                 # Write buffered frames for the 5-second pre-record buffer
                for buffered_frame in frame_buffer:
                    video_writer.write(buffered_frame)
            
            # If a person is not detected and we're recording, stop recording
            if not person_detected[camera_index] and recording:
                if time.time() - last_detection_time >= max_inactivity_time:
                    recording = False
                    video_writer.release()
                    print(f"Stopped recording: {output_filename}")

            if person_detected[camera_index]:
                last_detection_time = time.time()

                # Buffer frames for pre-record period before person appears
            if len(frame_buffer) < pre_record_buffer:
                frame_buffer.append(frame)
            else:
                frame_buffer.pop(0)
            
            # Write the frame to the video file if recording
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

    

# Routes for each camera
@app.route('/')
def index():
    return render_template('new.html')  # Ensure this file exists in the templates folder

@app.route('/video_feed/<int:camera_index>')
def video_feed(camera_index):
    return Response(generate_frames(camera_index),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detection_status')
def detection_status():
    try:
        # If any camera detects a person, return True
        any_person_detected = any(person_detected)  # person_detected is a list of detection statuses per camera
        return jsonify({'person_detected': any_person_detected})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Run Flask on port 5000
