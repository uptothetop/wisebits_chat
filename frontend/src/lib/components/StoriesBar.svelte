<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import StoryViewer from "./StoryViewer.svelte";

    let stories: any[] = [];
    let userStory: any = null;
    let showUpload = false;
    let fileInput: HTMLInputElement;
    let viewerOpen = false;
    let activeStoryIndex = 0;
    let activeStoryUserIndex = 0;

    onMount(loadStories);

    async function loadStories() {
        try {
            const res = await api("GET", "/stories");
            stories = res;
            // Check if current user has a story
            const myId = $authStore.user?._id;
            // Filter out current user from list to show separately as "Your Story"
            // Or just keep them in list. Let's keep separate "Your Story" icon.
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
            await api("POST", "/stories", formData); // API utility needs to handle FormData
            await loadStories();
        } catch (e) {
            alert("Failed to upload story");
        }
    }

    function openViewer(userIndex: number, storyIndex = 0) {
        activeStoryUserIndex = userIndex;
        activeStoryIndex = storyIndex;
        viewerOpen = true;
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
        scrollbar-width: none; /* Hide scrollbar */
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
        border-color: #e1306c; /* Instagram gradient-like color */
    }
    .avatar,
    .add-icon {
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
    .name {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        max-width: 64px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
