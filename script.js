/* script.js — Complete client-side BrainRotter app (single-file behavior) */

// DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const phonePreview = document.getElementById('phonePreview');
const dividerEl = document.getElementById('divider');
const captionBox = document.getElementById('captionBox');
const captionTextArea = document.getElementById('captionBox').querySelector('p') || document.getElementById('captionBox');
const captionInput = document.getElementById('captionBox') ? document.getElementById('captionBox') : null;
const captionTextNode = document.getElementById('captionBox').querySelector ? document.getElementById('captionBox').querySelector('p') : null;
const captionAreaText = document.getElementById('captionBox'); // we will set story via captionAreaText
const revealImage = document.getElementById('revealImage');
const fileInput = document.getElementById('fileInput');
const demoSelect = document.getElementById('demoSelect');
const newStoryBtn = document.getElementById('newStoryBtn');
const playRevealBtn = document.getElementById('playRevealBtn');
const exportBtn = document.getElementById('exportBtn');
const categorySelect = document.getElementById('categorySelect');
const fontSelect = document.getElementById('fontSelect');
const animSelect = document.getElementById('animSelect');
const textSize = document.getElementById('textSize');
const playbackRate = document.getElementById('playbackRate');
const watermarkToggle = document.getElementById('watermarkToggle');
const embedAudioCheckbox = document.getElementById('embedAudio');

const WATERMARK_TEXT = "BrainRotter";

// load categories from stories.js global
const storyAPI = window.__BR_STORIES;
const memeList = window.__BR_MEMES || [];

// state
let dividerPct = 0.6;
let currentStory = "";
let topVideo = null;
let topVideoURL = null;
let demoTime = 0;
let audioCtx = null;
let revealSource = null;
let revealNode = null;
let revealDest = null;
let lastDraw = performance.now();
let recorder = null;
let recordedBlobs = [];

// populate category select
(function initCategories(){
  const cats = storyAPI.getCategories();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });
})();

// helper: choose random
function choose(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// story generate
function generateStory(preset){
  const cat = preset || categorySelect.value || categorySelect.options[0].value;
  const s = storyAPI.getRandomStory(cat);
  currentStory = s;
  // set text into caption area (we use innerHTML in phone overlay)
  // captionAreaText is the overlay div; put text inside a <div> so CSS centers nicely.
  const textNode = document.getElementById('storyText') || null;
  if(textNode) textNode.textContent = s;
  else {
    // fallback: set innerText of caption area
    captionAreaText.textContent = s;
  }
  // auto trigger TTS preview (non-embedded)
  previewTTS(s);
  // schedule reveal for brainrot category
  if(cat === "Brainrot / Chaos"){
    scheduleReveal();
  } else {
    hideReveal();
  }
}

// TTS preview (does not get embedded reliably across browsers)
function previewTTS(text){
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = parseFloat(playbackRate.value) || 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch(e){
    // ignore
    console.warn('TTS preview failed', e);
  }
}

// reveal logic: pick random meme, fade-in and play synth ambience
function scheduleReveal(delay=900){
  // hide first
  hideReveal();
  // set image
  if(memeList && memeList.length){
    const url = choose(memeList);
    revealImage.src = url;
  } else {
    revealImage.src = '';
  }
  // schedule show
  setTimeout(()=> {
    revealImage.classList.add('show');
    // play sound
    playRevealSound();
  }, delay);
}
function hideReveal(){
  revealImage.classList.remove('show');
  stopRevealSound();
}

// synth "weird music" generator (short loop) — returns MediaStreamDestination for merging
function ensureAudioContext(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playRevealSound(){
  const ac = ensureAudioContext();
  stopRevealSound();
  // create ambient pad
  const master = ac.createGain(); master.gain.value = 0.9;
  const dest = ac.createMediaStreamDestination();
  master.connect(dest);
  // noise + low drones + wobble LFO
  // low drone oscillator
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 55 + Math.random()*20; // low pitch
  const oscGain = ac.createGain(); oscGain.gain.value = 0.12;
  osc.connect(oscGain).connect(master);

  // second oscillator for beating
  const osc2 = ac.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 110;
  const osc2Gain = ac.createGain(); osc2Gain.gain.value = 0.05;
  osc2.connect(osc2Gain).connect(master);

  // LFO to modulate cutoff via filter
  const filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 600;
  master.disconnect();
  oscGain.connect(filter); osc2Gain.connect(filter);
  filter.connect(ac.destination); // also to speakers
  filter.connect(dest);

  const lfo = ac.createOscillator(); lfo.frequency.value = 0.2 + Math.random()*0.6;
  const lfoGain = ac.createGain(); lfoGain.gain.value = 300;
  lfo.connect(lfoGain).connect(filter.frequency);

  // glitchy ticks using noise + bandpass
  const noise = (function(){
    const bufferSize = ac.sampleRate * 1.0;
    const buff = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buff.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * 0.3;
    const src = ac.createBufferSource();
    src.buffer = buff; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1200; bp.Q.value=3;
    const gain = ac.createGain(); gain.gain.value = 0.02;
    src.connect(bp).connect(gain).connect(filter);
    src.start();
    return src;
  })();

  // start oscillators
  osc.start();
  osc2.start();
  lfo.start();

  // schedule stop after 4.5s (short dramatic reveal)
  const stopAfter = 4500;
  setTimeout(()=> {
    try{
      osc.stop(); osc2.stop(); lfo.stop(); noise.stop();
    }catch(e){}
    // release nodes
  }, stopAfter);

  // record references so we can merge audio for export
  revealNode = { osc, osc2, lfo, noise, filter, master, dest };
  return dest;
}
function stopRevealSound(){
  if(revealNode){
    try{
      // stop nodes if still running
      revealNode.osc && revealNode.osc.stop && revealNode.osc.stop();
      revealNode.osc2 && revealNode.osc2.stop && revealNode.osc2.stop();
      revealNode.lfo && revealNode.lfo.stop && revealNode.lfo.stop();
      revealNode.noise && revealNode.noise.stop && revealNode.noise.stop();
    } catch(e){}
    // disconnect
    try{ revealNode.master && revealNode.master.disconnect(); }catch(e){}
    revealNode = null;
  }
}

// simple demo animated background (if no top video)
function drawDemoBackground(ctx, topH){
  // moving gradient circles
  const now = Date.now()/600;
  for(let i=0;i<12;i++){
    const x = (i*120 + now*60) % canvas.width;
    ctx.beginPath();
    const r = 60 + 12*Math.sin(now + i);
    const hue = (i*40 + (Date.now()/20)) % 360;
    ctx.fillStyle = `hsla(${hue},80%,60%,0.08)`;
    ctx.arc(x, topH/2 + Math.sin(i + now)*40, r, 0, Math.PI*2);
    ctx.fill();
  }
}

// canvas drawing loop
function wrapText(ctx, text, maxWidth){
  if(!text) return [];
  const words = text.split(' ');
  const lines = [];
  let cur = words[0] || '';
  for(let i=1;i<words.length;i++){
    const w = words[i];
    const measure = ctx.measureText(cur + ' ' + w).width;
    if(measure < maxWidth) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  lines.push(cur);
  return lines.slice(0,6);
}
function drawLoop(){
  // clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // compute area
  const topH = Math.floor(canvas.height * dividerPct);
  const bottomH = canvas.height - topH;

  // draw top (video if exists else demo)
  if(topVideo && topVideo.readyState >= 2){
    const vw = topVideo.videoWidth || topVideo.width;
    const vh = topVideo.videoHeight || topVideo.height;
    const scale = Math.max(canvas.width / vw, topH / vh);
    const sw = vw * scale, sh = vh * scale;
    const sx = (canvas.width - sw)/2, sy = (topH - sh)/2;
    ctx.drawImage(topVideo, sx, sy, sw, sh);
  } else {
    // demo
    ctx.fillStyle = '#071018';
    ctx.fillRect(0,0,canvas.width,topH);
    drawDemoBackground(ctx, topH);
  }

  // bottom panel
  ctx.fillStyle = '#07111a';
  ctx.fillRect(0, topH, canvas.width, bottomH);

  // captions
  const fontSz = parseInt(textSize.value,10) || 56;
  ctx.textAlign = 'center';
  ctx.font = `700 ${fontSz}px ${fontSelect.value || 'Inter'}`;
  const lines = wrapText(ctx, currentStory || 'Click New Story', canvas.width - 160);
  const anim = animSelect.value;
  const t = Date.now()/1000;
  for(let i=0;i<lines.length;i++){
    let dy = 0;
    if(anim === 'bounce') dy = Math.sin(t*4 + i) * 8;
    if(anim === 'zoom') ctx.font = `700 ${Math.floor(fontSz*(1+Math.sin(t*2+i)/12))}px ${fontSelect.value}`;
    if(anim === 'shake') dy = (Math.random()-0.5)*6;
    const y = topH + 100 + i*(fontSz+12) + dy;
    const up = lines[i].toUpperCase();
    if(/FIRE|FIRED|GONE|OMG|EXPOSED/.test(up)){
      ctx.fillStyle = '#ffef5f';
      ctx.strokeStyle = '#111';
    } else {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
    }
    ctx.lineWidth = Math.max(2, fontSz/12);
    ctx.strokeText(lines[i], canvas.width/2, y);
    ctx.fillText(lines[i], canvas.width/2, y);
  }

  // watermark
  if(watermarkToggle.checked){
    ctx.globalAlpha = 0.95;
    ctx.font = '700 30px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(WATERMARK_TEXT, canvas.width - 240, canvas.height - 40);
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(drawLoop);
}
requestAnimationFrame(drawLoop);

// divider dragging
let dragging = false;
dividerEl.addEventListener('pointerdown', e => { dragging = true; dividerEl.setPointerCapture(e.pointerId); });
window.addEventListener('pointerup', ()=> dragging = false);
window.addEventListener('pointermove', e => {
  if(!dragging) return;
  const rect = phonePreview.getBoundingClientRect();
  const y = e.clientY - rect.top;
  dividerPct = Math.max(0.22, Math.min(0.78, y / rect.height));
});

// file upload for top clip
fileInput.addEventListener('change', async e => {
  const f = e.target.files[0];
  if(!f) return;
  if(topVideoURL) URL.revokeObjectURL(topVideoURL);
  topVideoURL = URL.createObjectURL(f);
  const v = document.createElement('video');
  v.src = topVideoURL; v.loop = true; v.muted = true; v.playsInline = true;
  await v.play().catch(()=>{});
  topVideo = v;
});

// demo selector (no external assets, just change animation style)
demoSelect.addEventListener('change', e => {
  // we keep demo loop algorithmic; you could add different demo types here
});

// generate + reveal buttons
newStoryBtn.addEventListener('click', ()=>{
  generateStory();
});
playRevealBtn.addEventListener('click', ()=>{
  // show reveal immediately (for testing)
  revealImage.classList.add('show');
  playRevealSound();
  setTimeout(()=>{ revealImage.classList.remove('show'); stopRevealSound(); }, 4500);
});

// initial generation
function generateStory(){
  const cat = categorySelect.value || categorySelect.options[0].value;
  currentStory = storyAPI.getRandomStory(cat);
  // set overlay text element
  const storyTextEl = document.getElementById('storyText');
  if(storyTextEl) storyTextEl.textContent = currentStory;
  else {
    // create storyText node if not present
    const p = document.createElement('p'); p.id = 'storyText'; p.style.padding='8px'; p.style.margin='0';
    p.textContent = currentStory;
    const cap = document.querySelector('.caption-panel') || document.querySelector('.video-area #captionBox');
    if(cap) cap.appendChild(p);
  }
  // TTS preview
  previewTTS(currentStory);
  // reveal if brainrot
  if(categorySelect.value === 'Brainrot / Chaos'){
    // pick random meme and schedule reveal
    if(memeList && memeList.length){
      revealImage.src = choose(memeList);
    }
    // slight delay for drama
    setTimeout(()=> { revealImage.classList.add('show'); playRevealSound(); }, 900);
    // auto-hide after 4.5s
    setTimeout(()=> { revealImage.classList.remove('show'); stopRevealSound(); }, 5400);
  } else {
    revealImage.classList.remove('show');
    stopRevealSound();
  }
}

// export (.webm) with optional embedded reveal audio
exportBtn.addEventListener('click', async ()=>{
  // build merged stream: canvas + audio (if embedAudio checked and revealNode exists)
  exportBtn.disabled = true;
  exportBtn.textContent = 'Preparing...';

  // ensure AudioContext exists
  const ac = ensureAudioContext();

  // prepare audio dest if embedAudio is true and we can produce audio now
  let audioDest = null;
  if(embedAudioCheckbox.checked){
    // play a short reveal sound and capture its stream for embedding
    // We will re-play a short synth and capture via MediaStreamDestination
    // create a short buffer to play to a MediaStreamDestination
    // simpler: create dest from current audio nodes (if revealNode exists), else create a fresh short buffer
    if(revealNode && revealNode.dest){
      audioDest = revealNode.dest;
    } else {
      // create a short silent stream (or small click) to avoid no-audio exports
      const dest = ac.createMediaStreamDestination();
      const osc = ac.createOscillator();
      const g = ac.createGain(); g.gain.value = 0.00001; // nearly silent
      osc.frequency.value = 440; osc.connect(g).connect(dest);
      osc.start();
      setTimeout(()=>{ try{ osc.stop(); }catch(e){} }, 100);
      audioDest = dest;
    }
  }

  const canvasStream = canvas.captureStream(30);
  let finalStream = canvasStream;
  if(audioDest && audioDest.stream){
    finalStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(t=> finalStream.addTrack(t));
    audioDest.stream.getAudioTracks().forEach(t=> finalStream.addTrack(t));
  }

  // record
  recordedBlobs = [];
  let options = { mimeType: 'video/webm;codecs=vp9' };
  if(!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'video/webm;codecs=vp8' };
  if(!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'video/webm' };
  try {
    recorder = new MediaRecorder(finalStream, options);
  } catch(e){
    alert('Recording is not supported in this browser: ' + e.message);
    exportBtn.disabled = false;
    exportBtn.textContent = 'Export .webm';
    return;
  }
  recorder.ondataavailable = (ev) => { if(ev.data && ev.data.size) recordedBlobs.push(ev.data); };
  recorder.onstop = () => {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.style.display='none';
    a.href = url; a.download = 'brainrot_' + Date.now() + '.webm';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    exportBtn.disabled = false;
    exportBtn.textContent = 'Export .webm';
  };
  recorder.start();
  exportBtn.textContent = 'Recording...';

  // auto stop after 5.5s (short clip length)
  setTimeout(()=> {
    try{ recorder.stop(); } catch(e){}
  }, 5500);
});

// initial UI setup: pick first category and draw storyText node
(function init(){
  // fill select with categories
  const cats = window.__BR_STORIES.getCategories();
  cats.forEach(c => {
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c; categorySelect.appendChild(opt);
  });
  // show initial story text node
  const p = document.createElement('p'); p.id = 'storyText'; p.style.padding='16px'; p.style.margin='0'; p.textContent = 'Click New Story';
  const captionPanel = document.querySelector('.caption-panel');
  if(captionPanel) captionPanel.prepend(p);

  // hook generation
  generateStory();

})();
