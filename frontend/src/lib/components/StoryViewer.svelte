<script lang="ts">
    import { onMount } from "svelte";

    let {
        stories = [],
        initialUserIndex = 0,
        initialStoryIndex = 0,
        onClose = () => {},
    } = $props();

    let currentUserIndex = $state(initialUserIndex);
    let currentStoryIndex = $state(initialStoryIndex);
    let progress = $state(0);
    let timer: ReturnType<typeof setInterval>;
    const DURATION = 5000; // 5 seconds per story

    // Sync state with props if they change externally (optional pattern for controlled components)
    $effect(() => {
        currentUserIndex = initialUserIndex;
    });
    $effect(() => {
        currentStoryIndex = initialStoryIndex;
    });

    let currentUserGroup = $derived(stories[currentUserIndex]);
    let currentStory = $derived(currentUserGroup?.items[currentStoryIndex]);

    onMount(() => {
        startTimer();
        return () => stopTimer();
    });

    function startTimer() {
        stopTimer();
        progress = 0;
        const interval = 100;
        const step = 100 / (DURATION / interval);

        timer = setInterval(() => {
            progress += step;
            if (progress >= 100) {
                nextStory();
            }
        }, interval);
    }

    function stopTimer() {
        if (timer) clearInterval(timer);
    }

    function nextStory() {
        if (currentStoryIndex < currentUserGroup.items.length - 1) {
            currentStoryIndex++;
            startTimer();
        } else {
            nextUser();
        }
    }

    function prevStory() {
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            startTimer();
        } else {
            prevUser();
        }
    }

    function nextUser() {
        if (currentUserIndex < stories.length - 1) {
            currentUserIndex++;
            currentStoryIndex = 0;
            startTimer();
        } else {
            close();
        }
    }

    function prevUser() {
        if (currentUserIndex > 0) {
            currentUserIndex--;
            currentStoryIndex = 0;
            startTimer();
        } else {
            close(); // Or stay on first?
        }
    }

    function close() {
        stopTimer();
        onClose();
    }

    function handleVideoEnd() {
        nextStory();
    }
</script>

{#if currentStory}
    <div class="viewer-overlay">
        <div class="story-container">
            <!-- Header -->
            <div class="user-info">
                <div class="avatar">{currentUserGroup.user.username[0]}</div>
                <span class="username">{currentUserGroup.user.username}</span>
                <span class="time"
                    >{new Date(
                        currentStory.createdAt,
                    ).toLocaleTimeString()}</span
                >
                <button class="close-btn" onclick={close}>&times;</button>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                {#each currentUserGroup.items as item, i}
                    <div class="progress-bar-bg">
                        <div
                            class="progress-bar-fill"
                            style="width: {i < currentStoryIndex
                                ? '100%'
                                : i === currentStoryIndex
                                  ? progress + '%'
                                  : '0%'}"
                        ></div>
                    </div>
                {/each}
            </div>

            <!-- Content -->
            <div
                class="media-content"
                role="button"
                tabindex="0"
                aria-label="Story content. Click left to go back, right to advance."
                onclick={(e) => {
                    const width = e.currentTarget.offsetWidth;
                    if (e.clientX < width / 3) prevStory();
                    else nextStory();
                }}
                onkeydown={(e) => {
                    if (e.key === "ArrowLeft") prevStory();
                    else if (e.key === "ArrowRight") nextStory();
                    else if (e.key === "Escape") close();
                }}
            >
                {#if currentStory.type === "video"}
                    <video
                        src={`http://localhost:3000${currentStory.mediaUrl}`}
                        autoplay
                        muted
                        playsinline
                        onended={handleVideoEnd}
                        onloadedmetadata={(e) => {
                            // Optional: adjust duration to video length?
                        }}
                    ></video>
                {:else}
                    <img
                        src={`http://localhost:3000${currentStory.mediaUrl}`}
                        alt="Story"
                    />
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .viewer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .story-container {
        width: 100%;
        max-width: 400px; /* Mobile width */
        height: 100%;
        position: relative;
        background: #000;
        display: flex;
        flex-direction: column;
    }
    .user-info {
        position: absolute;
        top: 20px;
        left: 10px;
        right: 10px;
        z-index: 10;
        display: flex;
        align-items: center;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-weight: bold;
    }
    .username {
        font-weight: 600;
        margin-right: 10px;
    }
    .time {
        font-size: 0.8rem;
        opacity: 0.7;
        flex: 1;
    }
    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        line-height: 1;
    }
    .progress-container {
        position: absolute;
        top: 10px;
        left: 5px;
        right: 5px;
        display: flex;
        gap: 4px;
        z-index: 10;
    }
    .progress-bar-bg {
        flex: 1;
        height: 2px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
    }
    .progress-bar-fill {
        height: 100%;
        background: white;
        transition: width 0.1s linear;
    }
    .media-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    img,
    video {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Instagram style */
    }
</style>
