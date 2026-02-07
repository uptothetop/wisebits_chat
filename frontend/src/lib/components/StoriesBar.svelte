<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import StoryViewer from "./StoryViewer.svelte";

    import { _ } from "svelte-i18n";

    import type { UserStoryGroup } from "$lib/types";

    let { stories = [] }: { stories?: UserStoryGroup[] } = $props();
    let userStory = $state<UserStoryGroup | undefined>(undefined);
    let fileInput: HTMLInputElement;

    // Camera recording state
    let showCameraModal = $state(false);
    let cameraStream: MediaStream | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let recordedChunks: Blob[] = [];
    let isRecording = $state(false);
    let videoPreview = $state<HTMLVideoElement | undefined>(undefined);
    let recordingTime = $state(0);
    let recordingInterval: any; // Fix type issue

    // View State
    let viewerOpen = $state(false);
    let activeStoryUserIndex = $state(0);
    let activeStoryIndex = $state(0);

    const loadStories = async () => {
        try {
            const res = await api<UserStoryGroup[]>("GET", "/stories");
            stories = res;
            const myId = $authStore.user?._id;
            userStory = stories.find((s) => s.user._id === myId);
            stories = stories.filter((s) => s.user._id !== myId);
        } catch (e) {
            console.error(e);
        }
    };

    onMount(loadStories);

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            clearInterval(recordingInterval);
        }
    };

    const closeCamera = () => {
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
    };

    const uploadRecordedVideo = async () => {
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
    };

    const startRecording = () => {
        if (!cameraStream) return;

        recordedChunks = [];
        recordingTime = 0;

        // Use reliable mimeType for audio+video
        const mimeTypes = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
            "video/mp4",
        ];

        let selectedMimeType = "";
        for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                selectedMimeType = type;
                break;
            }
        }

        mediaRecorder = new MediaRecorder(cameraStream, {
            mimeType: selectedMimeType || "video/webm",
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
    };

    const openCamera = async () => {
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
    };

    const handleUpload = async (e: Event) => {
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
    };

    const openViewer = (userIndex: number, storyIndex = 0) => {
        activeStoryUserIndex = userIndex;
        activeStoryIndex = storyIndex;
        viewerOpen = true;
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
</script>

<div class="stories-bar-container">
    <div class="stories-bar">
        <!-- Your Story -->
        <div class="story-item">
            <button
                type="button"
                class="avatar-ring {userStory ? 'active' : ''}"
                onclick={() => (userStory ? openViewer(-1) : fileInput.click())}
                aria-label={userStory
                    ? $_("stories.view_story")
                    : $_("stories.add_story")}
            >
                {#if !userStory}
                    <div class="add-icon">+</div>
                {:else}
                    <div class="avatar">{userStory.user.username[0]}</div>
                {/if}
            </button>
            <span class="name">{$_("stories.your_story")}</span>
            <input
                type="file"
                accept="video/*,image/*"
                bind:this={fileInput}
                onchange={handleUpload}
                style="display: none;"
            />
        </div>

        <!-- Other Stories -->
        {#each stories as story, index}
            <div class="story-item">
                <button
                    type="button"
                    class="avatar-ring active"
                    onclick={() => openViewer(index)}
                    aria-label="View {story.user.username}'s story"
                >
                    <div class="avatar">{story.user.username[0]}</div>
                </button>
                <span class="name">{story.user.username}</span>
            </div>
        {/each}

        <!-- Camera Button -->
        <button
            class="camera-btn"
            onclick={openCamera}
            aria-label={$_("camera.open_camera")}
        >
            📷
        </button>
    </div>
</div>

<!-- Camera Modal -->
{#if showCameraModal}
    <div
        class="camera-modal"
        role="dialog"
        aria-modal="true"
        onclick={(e) => e.target === e.currentTarget && closeCamera()}
        onkeydown={(e) => e.key === "Escape" && closeCamera()}
        tabindex="-1"
    >
        <div class="camera-container">
            <video
                bind:this={videoPreview}
                class="camera-preview"
                autoplay
                playsinline
                muted
            ></video>

            <div class="camera-controls">
                {#if !isRecording}
                    <button class="record-btn" onclick={startRecording}>
                        {$_("camera.start_recording")}
                    </button>
                {:else}
                    <button class="stop-btn" onclick={stopRecording}>
                        <div class="stop-icon"></div>
                        {formatTime(recordingTime)}
                    </button>
                {/if}
                <button class="close-btn" onclick={closeCamera}>×</button>
            </div>
        </div>
    </div>
{/if}

<!-- Story Viewer -->
{#if viewerOpen}
    <StoryViewer
        stories={activeStoryUserIndex === -1 ? [userStory] : stories}
        initialUserIndex={activeStoryUserIndex === -1
            ? 0
            : activeStoryUserIndex}
        initialStoryIndex={activeStoryIndex}
        onClose={() => (viewerOpen = false)}
    />
{/if}

<style>
    .stories-bar-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--surface-color);
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        width: 100%;
    }

    .stories-bar {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        flex: 1;
        scrollbar-width: none; /* Firefox */
    }
    .stories-bar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Edge */
    }

    .story-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        min-width: 64px; /* Ensure items don't shrink too much */
    }

    .avatar-ring {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        padding: 2px;
        background: transparent;
        border: 2px solid var(--border-color);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar-ring.active {
        border-color: var(--primary);
        background: linear-gradient(
            45deg,
            #f09433 0%,
            #e6683c 25%,
            #dc2743 50%,
            #cc2366 75%,
            #bc1888 100%
        );
        padding: 3px;
    }

    .add-icon {
        width: 100%;
        height: 100%;
        background: var(--bg-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: var(--primary);
    }

    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--bg-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.25rem;
        color: var(--text-main);
        object-fit: cover;
        border: 2px solid var(--surface-color);
    }

    .name {
        font-size: 0.75rem;
        color: var(--text-secondary);
        max-width: 70px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .camera-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--surface-color);
        border: 1px dashed var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0; /* Prevent shrinking */
    }

    .camera-btn:hover {
        background: var(--bg-color);
        border-color: var(--primary);
    }

    .camera-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 2000;
        display: flex;
        flex-direction: column;
    }

    .camera-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .camera-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .camera-controls {
        position: absolute;
        bottom: 2rem;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        pointer-events: none; /* Allow clicks to pass through unless on a button */
    }

    .record-btn,
    .stop-btn {
        pointer-events: auto; /* Re-enable clicks for buttons */
        padding: 1rem 2rem;
        border-radius: 2rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .record-btn {
        background: #ff3b30;
        color: white;
    }

    .stop-btn {
        background: white;
        color: black;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.6);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        color: white;
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

    .stop-icon {
        width: 12px;
        height: 12px;
        background: #ff3b30;
        border-radius: 2px;
    }

    .close-btn {
        pointer-events: auto;
        position: absolute;
        top: 2rem;
        right: 2rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1002;
    }
</style>
