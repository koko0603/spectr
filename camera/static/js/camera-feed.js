/*CAMERA FEED FULL SCREEN */
document.addEventListener("DOMContentLoaded", function () {
    const numCams = 4; // Number of webcam blocks available
    const baseUrl = "http://127.0.0.1:5001/video_feed/";
    const noSignalImage = "images/Convenient-store-4.jpg"; // Path to the fallback image
  
    // for (let i = 0; i < numCams; i++) {
    //   const imgElement = document.getElementById(`webcam${i + 1}`);
    //   const camUrl = `${baseUrl}${i}`;
  
    //   // Set the streaming URL for each webcam image
    //   imgElement.src = camUrl;
  
    //   // Add an error handler to load fallback image if the stream fails
    //   imgElement.onerror = function () {
    //     imgElement.src = noSignalImage;
    //   };
    // }
  
    // Add event listeners to images for full screen mode
    document.querySelectorAll(".block img").forEach((img) => {
      img.addEventListener("click", () => {
        // Only proceed if the image source is not the fallback image
        if (img.src !== noSignalImage) {
          // Create fullscreen container
          const fullScreenContainer = document.createElement("div");
          fullScreenContainer.classList.add("fullscreen");
  
          // Add the selected webcam feed in fullscreen
          const videoElement = document.createElement("img");
          videoElement.src = img.src;
          fullScreenContainer.appendChild(videoElement);
  
          // Append the fullscreen container to the body
          document.body.appendChild(fullScreenContainer);
  
          // Show the "Press Esc to exit" notification
          const escNotification = document.createElement("div");
          escNotification.classList.add("esc-notification");
          escNotification.textContent = "Press Esc to exit fullscreen";
          fullScreenContainer.appendChild(escNotification);
  
          // Automatically hide the notification after 3 seconds
          setTimeout(() => {
            escNotification.style.opacity = "0";
          }, 1500);
        }
      });
    });
  
    // Optional: Exit fullscreen when pressing "Escape"
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const fullscreenElement = document.querySelector(".fullscreen");
        if (fullscreenElement) {
          fullscreenElement.remove();
        }
      }
    });
  });
  