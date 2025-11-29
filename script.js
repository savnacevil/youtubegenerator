import { getRandomStory, getCategories } from './stories.js';

const categorySelect = document.getElementById("categorySelect");
const generateBtn = document.getElementById("generateBtn");
const storyText = document.getElementById("storyText");
const brainrotImage = document.getElementById("brainrotImage");
const brainrotSound = document.getElementById("brainrotSound");

// Populate categories on load
getCategories().forEach(cat => {
  const option = document.createElement("option");
  option.value = cat;
  option.textContent = cat;
  categorySelect.appendChild(option);
});

generateBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const story = getRandomStory(category);

  storyText.textContent = story;

  brainrotSound.pause();
  brainrotSound.currentTime = 0;
  brainrotImage.classList.remove("visible");

  if (category === "Brainrot / Chaos") {
    setTimeout(() => {
      brainrotImage.classList.add("visible");
      brainrotSound.play();
    }, 900);
  }
});
