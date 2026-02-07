<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import StoryViewer from "./StoryViewer.svelte";

    let stories: any[] = [];
    let userStory: any = null;
    let fileInput: HTMLInputElement;
    let viewerOpen = false;
    let activeStoryIndex = 0;
    let activeStoryUserIndex = 0;

    // Camera recording state
    let showCameraModal = false;
    let cameraStream: MediaStream | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let recordedChunks: Blob[] = [];
    let isRecording = false;
    let videoPreview: HTMLVideoElement;
    let recordingTime = 0;
    let recordingInterval: number;

    onMount(loadStories);

    async function loadStories() {
        try {
            const res = await api("GET", "/stories");
            stories = res;
            const myId = $authStore.user?._id;
            userStory = stories.find((s) => s.user._id === myId);
            stories = stories.filter((s) => s.user._id !== myId);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleUpload(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api("POST", "/stories", formData);
            await loadStories();
        } catch (e) {
            alert("Failed to upload story");
        }
    }

    async function openCamera() {
        try {
            showCameraModal = true;
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 720, height: 1280 },
                audio: true,
            });

            // Wait for next tick to ensure videoPreview exists
            setTimeout(() => {
                if (videoPreview && cameraStream) {
                    videoPreview.srcObject = cameraStream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Please grant camera permissions to record stories");
            closeCamera();
        }
    }

    function startRecording() {
        if (!cameraStream) return;

        recordedChunks = [];
        recordingTime = 0;

        mediaRecorder = new MediaRecorder(cameraStream, {
            mimeType: "video/webm;codecs=vp9",
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = uploadRecordedVideo;

        mediaRecorder.start();
        isRecording = true;

        // Start timer
        recordingInterval = setInterval(() => {
            recordingTime++;
            // Auto-stop after 30 seconds
            if (recordingTime >= 30) {
                stopRecording();
            }
        }, 1000);
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            clearInterval(recordingInterval);
        }
    }

    async function uploadRecordedVideo() {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const file = new File([blob], `story-${Date.now()}.webm`, {
            type: "video/webm",
        });

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api("POST", "/stories", formData);
            await loadStories();
            closeCamera();
        } catch (e) {
            alert("Failed to upload story");
        }
    }

    function closeCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }
        if (isRecording) {
            stopRecording();
        }
        showCameraModal = false;
        recordedChunks = [];
        recordingTime = 0;
    }

    function openViewer(userIndex: number, storyIndex = 0) {
        activeStoryUserIndex = userIndex;
        activeStoryIndex = storyIndex;
        viewerOpen = true;
    }

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
</script>

<div class="stories-bar">
    <!-- Your Story -->
    <div class="story-item">
        <button
            type="button"
            class="avatar-ring {userStory ? 'active' : ''}"
            on:click={() => (userStory ? openViewer(-1) : fileInput.click())}
            aria-label={userStory ? "View your story" : "Add your story"}
        >
            {#if !userStory}
                <div class="add-icon">+</div>
            {:else}
                <div class="avatar">{userStory.user.username[0]}</div>
            {/if}
        </button>
        <span class="name">Your Story</span>
        <input
            type="file"
            accept="video/*,image/*"
            bind:this={fileInput}
            on:change={handleUpload}
            style="display: none;"
        />
    </div>

    <!-- Camera Record Button -->
    <div class="story-item">
        <button
            type="button"
            class="avatar-ring camera-button"
            on:click={openCamera}
            aria-label="Record story"
        >
            <div class="camera-icon">📷</div>
        </button>
        <span class="name">Record</span>
    </div>

    <!-- Friends Stories -->
    {#each stories as group, i}
        <div class="story-item">
            <button
                type="button"
                class="avatar-ring active"
                on:click={() => openViewer(i)}
                aria-label="View {group.user.username}'s story"
            >
                <div class="avatar">{group.user.username[0]}</div>
            </button>
            <span class="name">{group.user.username}</span>
        </div>
    {/each}
</div>

<!-- Camera Modal -->
{#if showCameraModal}
    <div class="camera-modal" on:click|self={closeCamera}>
        <div class="camera-container">
            <video
                bind:this={videoPreview}
                class="camera-preview"
                autoplay
                playsinline
                muted
            ></video>

            <div class="camera-controls">
                {#if isRecording}
                    <div class="recording-indicator">
                        <span class="rec-dot"></span>
                        <span class="rec-time">{formatTime(recordingTime)}</span
                        >
                    </div>
                {/if}

                <div class="control-buttons">
                    <button
                        type="button"
                        class="control-btn close-btn"
                        on:click={closeCamera}
                        aria-label="Close camera"
                    >
                        ✕
                    </button>

                    {#if !isRecording}
                        <button
                            type="button"
                            class="control-btn record-btn"
                            on:click={startRecording}
                            aria-label="Start recording"
                        >
                            ⏺
                        </button>
                    {:else}
                        <button
                            type="button"
                            class="control-btn stop-btn"
                            on:click={stopRecording}
                            aria-label="Stop recording"
                        >
                            ⏹
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

{#if viewerOpen}
    <StoryViewer
        stories={activeStoryUserIndex === -1 ? [userStory] : stories}
        initialUserIndex={activeStoryUserIndex === -1
            ? 0
            : activeStoryUserIndex}
        on:close={() => (viewerOpen = false)}
    />
{/if}

<style>
    .stories-bar {
        display: flex;
        overflow-x: auto;
        padding: 1rem;
        gap: 1rem;
        background: #fff;
        border-bottom: 1px solid #eee;
        scrollbar-width: none;
    }
    .stories-bar::-webkit-scrollbar {
        display: none;
    }
    .story-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        min-width: 64px;
    }
    .avatar-ring {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        padding: 2px;
        border: 2px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        cursor: pointer;
    }
    .avatar-ring.active {
        border-color: #e1306c;
    }
    .avatar-ring.camera-button {
        border-color: #0095f6;
    }
    .avatar,
    .add-icon,
    .camera-icon {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }
    .add-icon {
        font-size: 1.5rem;
        color: #0095f6;
        background: #fff;
    }
    .camera-icon {
        font-size: 1.5rem;
        background: #fff;
    }
    .name {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        max-width: 64px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Camera Modal */
    .camera-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    .camera-container {
        position: relative;
        width: 100%;
        max-width: 500px;
        height: 80vh;
        background: #000;
        border-radius: 12px;
        overflow: hidden;
    }
    .camera-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .camera-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    }
    .recording-indicator {
        position: absolute;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.6);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        color: white;
    }
    .rec-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ff0000;
        animation: pulse 1s infinite;
    }
    .rec-time {
        font-weight: 600;
        font-family: monospace;
    }
    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    .control-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
    }
    .control-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid white;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .control-btn:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
    }
    .record-btn {
        background: #e1306c;
        border-color: #e1306c;
    }
    .stop-btn {
        background: #ff4444;
        border-color: #ff4444;
    }
    .close-btn {
        width: 48px;
        height: 48px;
        font-size: 1.5rem;
    }
</style>
