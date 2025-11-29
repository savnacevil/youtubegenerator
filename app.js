/* =============================================================
   GLOBAL VARIABLES
============================================================= */

let storyText = "";
let selectedVideoBlob = null;
let dragging = false;
let startY;
let startTopHeight;

/* =============================================================
   ELEMENT REFERENCES
============================================================= */

const previewVideo = document.getElementById("previewVideo");
const previewCaptions = document.getElementById("previewCaptions");

const topBox = document.getElementById("topBox");
const bottomBox = document.getElementById("bottomBox");
const resizeBar = document.getElementById("resizeBar");

const storyBox = document.getElementById("storyBox");
const generateStoryBtn = document.getElementById("generateStoryBtn");

const uploadVideo = document.getElementById("uploadVideo");
const useLibraryBtn = document.getElementById("useLibraryBtn");

const renderVideoBtn = document.getElementById("renderVideoBtn");
const downloadVideoBtn = document.getElementById("downloadVideoBtn");

const thumbnailBtn = document.getElementById("thumbnailBtn");
const downloadThumbnailBtn = document.getElementById("downloadThumbnailBtn");



/* =============================================================
   1. STORY GENERATOR
   (Brainrot style templates)
============================================================= */

const brainrotTemplates = [
    "So in 7th grade, everything was normal until this one kid showed up with a whole suitcase. Not a backpack — a suitcase. He rolled it through the hallway like he was catching a flight. Everyone was staring. Then in lunch, he opened it… and it was filled with Lunchables. Like 40 of them. He said he was starting a business.",
    
    "I swear this literally happened. So I'm in class, minding my own business, and the teacher starts yelling because someone stole her glitter pens again. Plot twist: it was the principal. He said he needed them for a poster competition.",
    
    "Back in 6th grade I had this friend who lied about EVERYTHING. One time he told us he owned a mansion. We believed him… until his mom picked him up in a rusty minivan with a missing door handle. He yelled 'Mom not today!'",
    
    "So my school had this kid who would run everywhere. Not walk — RUN. One day he was sprinting to lunch and slipped on the floor. The principal tried to help him up, and he said 'Don't touch me, I'm still in race mode.'",
    
    "So the substitute teacher walks in and everyone already knows it's about to be chaos. She tried to write her name on the board but the marker didn't work. Someone threw another marker at her like it was a grenade. She ducked behind the desk.",
    
    "In 5th grade we had a talent show. One kid got on stage and started doing Fortnite emotes for the entire two minutes. No music. Just silence and commitment. He won by a landslide."
];


/* =============================================================
   Function: Generate Story
============================================================= */

function generateStory() {
    const genre = document.getElementById("genreSelect").value;

    if (storyBox.value.trim() !== "") {
        storyText = storyBox.value.trim();
    } else {
        // Only brainrot for now
        const templates = brainrotTemplates;
        storyText = templates[Math.floor(Math.random() * templates.length)];
    }

    previewCaptions.textContent = storyText;
}

generateStoryBtn.addEventListener("click", generateStory);



/* =============================================================
   2. VIDEO UPLOAD HANDLER
============================================================= */

uploadVideo.addEventListener("change", function () {
    const file = uploadVideo.files[0];
    if (!file) return;

    selectedVideoBlob = URL.createObjectURL(file);
    previewVideo.src = selectedVideoBlob;
});



/* =============================================================
   3. USE BUILT-IN LIBRARY (RANDOM CLIP)
============================================================= */

useLibraryBtn.addEventListener("click", function () {

    // Example built-in clips
    const builtInClips = [
        "assets/videos/satisfying/clip1.mp4",
        "assets/videos/satisfying/clip2.mp4",
        "assets/videos/satisfying/clip3.mp4"
        // (You will add 100+ real ones)
    ];

    const randomClip = builtInClips[Math.floor(Math.random() * builtInClips.length)];
    previewVideo.src = randomClip;
});



/* =============================================================
   4. RESIZE TOP/BOTTOM DIVS WITH DRAG BAR
============================================================= */

resizeBar.addEventListener("mousedown", (e) => {
    dragging = true;
    startY = e.clientY;
    startTopHeight = topBox.offsetHeight;
});

document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const delta = e.clientY - startY;
    const newHeight = startTopHeight + delta;

    if (newHeight > 50 && newHeight < 1700) {
        topBox.style.height = newHeight + "px";
        bottomBox.style.top = newHeight + "px";
        resizeBar.style.top = newHeight + "px";
    }
});

document.addEventListener("mouseup", () => {
    dragging = false;
});



/* =============================================================
   5. TEXT-TO-SPEECH (TTS)
============================================================= */

function speakStory() {
    const voiceSelect = document.getElementById("voiceSelect").value;

    const utter = new SpeechSynthesisUtterance(storyText);

    // Choose a voice based on style
    const voices = speechSynthesis.getVoices();

    switch (voiceSelect) {
        case "deepMale":
            utter.voice = voices.find(v => v.name.includes("Male")) || voices[0];
            utter.pitch = 0.7;
            utter.rate = 1.0;
            break;

        case "tiktokFemale":
            utter.voice = voices.find(v => v.name.includes("Female")) || voices[0];
            utter.pitch = 1.2;
            utter.rate = 1.1;
            break;

        case "kid":
            utter.pitch = 1.6;
            utter.rate = 1.3;
            break;

        case "asmr":
            utter.pitch = 0.8;
            utter.rate = 0.8;
            utter.volume = 0.7;
            break;

        default:
            // random
            utter.pitch = 0.9 + Math.random() * 0.6;
            utter.rate = 1.0 + Math.random() * 0.3;
            break;
    }

    speechSynthesis.speak(utter);

    return utter; // will use later for rendering
}



/* =============================================================
   6. RENDER VIDEO (placeholder until Phase 2)
============================================================= */

renderVideoBtn.addEventListener("click", () => {
    alert("Rendering will be added in the next file (ffmpeg phase).");
});



/* =============================================================
   7. THUMBNAIL GENERATION (Phase 1)
============================================================= */

thumbnailBtn.addEventListener("click", () => {
    const video = previewVideo;

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add bold text
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;

    ctx.strokeText("CRAZY STORY 😱", 40, 650);
    ctx.fillText("CRAZY STORY 😱", 40, 650);

    const url = canvas.toDataURL("image/png");

    downloadThumbnailBtn.href = url;
    downloadThumbnailBtn.download = "thumbnail.png";
    downloadThumbnailBtn.disabled = false;
});


