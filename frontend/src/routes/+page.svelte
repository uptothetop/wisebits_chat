<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { api } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import {
        initSocket,
        disconnectSocket,
        socketStore,
    } from "$lib/stores/socket";
    import { goto } from "$app/navigation";
    import { derived, get, writable } from "svelte/store";

    let conversations: any[] = [];
    let activeConversation: any = null;
    let activeMessages: any[] = [];
    let messageInput = "";
    let searchQuery = "";
    // searchResults type: User[]
    let searchResults: any[] = [];
    let showSearch = false;

    onMount(async () => {
        // Auth check
        // Wait for store to be populated from localstorage (sync)
        if (!get(authStore).isAuthenticated) {
            goto("/login");
            return;
        }

        const socket = initSocket();
        if (socket) {
            socket.on("receiveMessage", (msg: any) => {
                handleIncomingMessage(msg);
            });
        }

        await loadConversations();
    });

    onDestroy(() => {
        disconnectSocket();
    });

    async function loadConversations() {
        try {
            conversations = await api("GET", "/chat/conversations");
        } catch (e) {
            console.error("Failed to load conversations", e);
        }
    }

    async function selectConversation(conv: any) {
        activeConversation = conv;
        try {
            activeMessages = await api(
                "GET",
                `/chat/conversations/${conv._id}/messages`,
            );
            scrollToBottom();
        } catch (e) {
            console.error("Failed to load messages", e);
        }
    }

    function handleIncomingMessage(msg: any) {
        // If active conversation matches, append to messages
        if (activeConversation && msg.conversation === activeConversation._id) {
            activeMessages = [...activeMessages, msg]; // Svelte 5 reactivity might need explicit assignment or mutable state (Runes).
            // If we are using legacy mode (no runes), assignment triggers update.
            scrollToBottom();
        }

        // Update conversation list lastMessage
        const convIndex = conversations.findIndex(
            (c) => c._id === msg.conversation,
        );
        if (convIndex > -1) {
            const conv = conversations[convIndex];
            conv.lastMessage = msg;
            // Move to top
            const otherConvs = conversations.filter((c) => c._id !== conv._id);
            conversations = [conv, ...otherConvs];
        } else {
            // New conversation initiated by someone else? Reload list
            loadConversations();
        }
    }

    async function handleSendMessage() {
        if (!messageInput.trim() || !activeConversation) return;

        // Find recipient
        const me = get(authStore).user;
        if (!me) return;
        const recipient = activeConversation.participants.find(
            (p: any) => p._id !== me._id,
        );
        if (!recipient) return;

        const socket = get(socketStore);
        if (socket) {
            // Optimistic upate? No, waiting for server ack (receiveMessage) is safer for consistence.
            // But we can clear input immediately.
            socket.emit("sendMessage", {
                recipientId: recipient._id,
                content: messageInput,
            });
            messageInput = "";
        }
    }

    async function handleSearch() {
        if (!searchQuery) {
            searchResults = [];
            return;
        }
        try {
            searchResults = await api("GET", `/users?q=${searchQuery}`);
        } catch (e) {
            console.error(e);
        }
    }

    async function startChat(user: any) {
        try {
            // Create conversation
            const conv = await api("POST", "/chat/conversations", {
                recipientId: user._id,
            });
            // Reload conversations and select
            await loadConversations();
            // Find the new conversation object in the reloaded list (it might have populate fields)
            const fullConv = conversations.find((c) => c._id === conv._id);
            if (fullConv) {
                selectConversation(fullConv);
            }
            showSearch = false;
            searchQuery = "";
            searchResults = [];
        } catch (e) {
            console.error(e);
        }
    }

    function scrollToBottom() {
        setTimeout(() => {
            const el = document.getElementById("message-list");
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);
    }

    function getOtherUser(conv: any) {
        const me = get(authStore).user;
        if (!me) return { username: "Unknown" };
        return (
            conv.participants.find((p: any) => p._id !== me._id) || {
                username: "Unknown",
            }
        );
    }
</script>

<div class="container">
    <div class="sidebar">
        <div class="header">
            <h2>Chats</h2>
            <button on:click={() => (showSearch = !showSearch)}>
                {showSearch ? "Cancel" : "New Chat"}
            </button>
        </div>

        {#if showSearch}
            <div class="search-area">
                <input
                    bind:value={searchQuery}
                    on:input={handleSearch}
                    placeholder="Search user..."
                />
                <div class="results">
                    {#each searchResults as user}
                        <button
                            class="result-item"
                            on:click={() => startChat(user)}
                        >
                            {user.username}
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="conversation-list">
                {#each conversations as conv}
                    <button
                        class="conversation-item"
                        class:active={activeConversation?._id === conv._id}
                        on:click={() => selectConversation(conv)}
                    >
                        <div class="avatar">
                            {(
                                getOtherUser(conv)?.username[0] || "?"
                            ).toUpperCase()}
                        </div>
                        <div class="details">
                            <div class="name">
                                {getOtherUser(conv)?.username}
                            </div>
                            <div class="last-message">
                                {conv.lastMessage?.content || "No messages"}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="main">
        {#if activeConversation}
            <div class="chat-header">
                {getOtherUser(activeConversation)?.username}
            </div>
            <div class="message-list" id="message-list">
                {#each activeMessages as msg}
                    <div
                        class="message"
                        class:own={msg.sender._id === $authStore.user?._id}
                    >
                        <div class="bubble">
                            {#if msg.sender._id !== $authStore.user?._id}
                                <div class="sender-name">
                                    {msg.sender.username}
                                </div>
                            {/if}
                            {msg.content}
                        </div>
                    </div>
                {/each}
            </div>
            <div class="input-area">
                <input
                    bind:value={messageInput}
                    on:keydown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <button on:click={handleSendMessage}>Send</button>
            </div>
        {:else}
            <div class="empty-state">
                Select a conversation to start chatting
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        display: flex;
        height: calc(100vh - 60px); /* Adjust for navbar */
        border: 1px solid #ccc;
        background: white;
    }
    .sidebar {
        width: 300px;
        border-right: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
    }
    .header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .search-area {
        padding: 1rem;
    }
    .results {
        margin-top: 0.5rem;
        border: 1px solid #eee;
        background: white;
    }
    .result-item {
        padding: 0.5rem;
        cursor: pointer;
        width: 100%;
        text-align: left;
        border: none;
        background: none;
    }
    .result-item:hover {
        background: #f0f0f0;
    }
    .conversation-item {
        display: flex;
        padding: 1rem;
        cursor: pointer;
        border: none;
        border-bottom: 1px solid #eee;
        background: none;
        width: 100%;
        text-align: left;
        align-items: center;
    }
    .conversation-item:hover,
    .conversation-item.active {
        background: #e9ecef;
    }
    .avatar {
        width: 40px;
        height: 40px;
        background: #007bff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        font-weight: bold;
        flex-shrink: 0;
    }
    .details {
        flex: 1;
        overflow: hidden;
    }
    .name {
        font-weight: bold;
        margin-bottom: 0.2rem;
    }
    .last-message {
        color: #666;
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .main {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .chat-header {
        padding: 1rem;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        background: #f8f9fa;
    }
    .message-list {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: #fff;
    }
    .message {
        display: flex;
        width: 100%;
    }
    .message.own {
        justify-content: flex-end;
    }
    .bubble {
        padding: 0.75rem 1rem;
        background: #f1f0f0;
        border-radius: 1rem;
        max-width: 70%;
        position: relative;
        word-wrap: break-word;
    }
    .message.own .bubble {
        background: #007bff;
        color: white;
        border-bottom-right-radius: 0.2rem;
    }
    .message:not(.own) .bubble {
        border-bottom-left-radius: 0.2rem;
    }
    .sender-name {
        font-size: 0.7rem;
        color: #888;
        margin-bottom: 0.2rem;
    }
    .input-area {
        padding: 1rem;
        border-top: 1px solid #ddd;
        display: flex;
        gap: 0.5rem;
        background: #f8f9fa;
    }
    input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 1.5rem;
        outline: none;
    }
    input:focus {
        border-color: #007bff;
    }
    button {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 1.5rem;
        cursor: pointer;
        font-weight: bold;
    }
    button:hover {
        background: #0056b3;
    }
    .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 1.2rem;
    }
</style>
