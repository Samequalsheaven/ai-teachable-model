const URL = "https://teachablemachine.withgoogle.com/models/Qrq3_QVqU/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const startBtn = document.getElementById("start-btn");
    const spinner = document.getElementById("loading-spinner");
    
    startBtn.classList.add("hidden");
    spinner.classList.remove("hidden");

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true; 
        webcam = new tmImage.Webcam(400, 400, flip); 
        await webcam.setup(); 
        await webcam.play();
        window.requestAnimationFrame(loop);

        spinner.classList.add("hidden");
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = ""; // Clear any placeholder comments/whitespace
        for (let i = 0; i < maxPredictions; i++) {
            const item = document.createElement("div");
            item.className = "prediction-item";
            item.innerHTML = `
                <span class="label-name">${model.getClassLabels()[i]}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            `;
            labelContainer.appendChild(item);
        }
    } catch (e) {
        console.error("Error initializing model:", e);
        alert("Failed to load camera or model. Please check permissions.");
        startBtn.classList.remove("hidden");
        spinner.classList.add("hidden");
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const prob = prediction[i].probability;
        const item = labelContainer.children[i];
        if (!item) continue;

        const bar = item.querySelector(".progress-fill");
        if (bar) bar.style.width = (prob * 100) + "%";
        
        // Highlight active prediction
        if (prob > 0.8) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    }
}
