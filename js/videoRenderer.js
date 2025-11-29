// js/videoRenderer.js
// Handles final MP4 rendering using ffmpeg.wasm

let ffmpeg;
let isFFmpegLoaded = false;

async function loadFFmpeg() {
    if (isFFmpegLoaded) return;
    ffmpeg = FFmpeg.createFFmpeg({ log: true });
    await ffmpeg.load();
    isFFmpegLoaded = true;
}

// Main rendering function
async function renderVideoWithCaptions(videoBlob, audioBlob, captionData, onProgress) {
    await loadFFmpeg();

    const inputVideoName = "input_video.mp4";
    const inputAudioName = "input_audio.mp3";
    const outputName = "output.mp4";

    ffmpeg.FS("writeFile", inputVideoName, await FFmpeg.fetchFile(videoBlob));
    ffmpeg.FS("writeFile", inputAudioName, await FFmpeg.fetchFile(audioBlob));

    // Build ASS subtitles file
    const assContent = captionsToASS(captionData);
    ffmpeg.FS("writeFile", "subs.ass", new TextEncoder().encode(assContent));

    // FFmpeg burn subtitles
    await ffmpeg.run(
        "-i", inputVideoName,
        "-i", inputAudioName,
        "-vf", "subtitles=subs.ass:force_style='Fontsize=48,OutlineColour=&H000000&,Outline=4'",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-shortest",
        outputName
    );

    const data = ffmpeg.FS("readFile", outputName);

    return new Blob([data.buffer], { type: "video/mp4" });
}

// Convert caption timing to ASS format for burning
function captionsToASS(captions) {
    let ass =
`[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV
Style: Default,Arial,60,&H00FFFFFF,&H00000000,1,5,0,2,50,50,100

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Text
`;
    for (const c of captions) {
        ass += `Dialogue: 0,${formatTime(c.start)},${formatTime(c.end)},Default,,0,0,50,${c.text}\n`;
    }
    return ass;
}

// Convert ms to ASS timestamp
function formatTime(ms) {
    const h = Math.floor(ms / 3600000).toString().padStart(1, '0');
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${h}:${m}:${s}.${cs}`;
}

export { renderVideoWithCaptions };
