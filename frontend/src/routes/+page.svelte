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
    import { get } from "svelte/store";
    import StoriesBar from "$lib/components/StoriesBar.svelte";
    import { _ } from "svelte-i18n";
    import type { Conversation, Message, User } from "$lib/types";

    let conversations = $state<Conversation[]>([]);
    let activeConversation = $state<Conversation | null>(null);
    let activeMessages = $state<Message[]>([]);
    let messageInput = $state("");
    let searchQuery = $state("");
    let searchResults = $state<User[]>([]);
    let showSearch = $state(false);

    const getSenderId = (msg: Message) => {
        return typeof msg.sender === "string" ? msg.sender : msg.sender._id;
    };

    const getSenderName = (msg: Message) => {
        return typeof msg.sender === "string" ? "Unknown" : msg.sender.username;
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            const el = document.getElementById("message-list");
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);
    };

    const loadConversations = async () => {
        try {
            conversations = await api<Conversation[]>(
                "GET",
                "/chat/conversations",
            );
        } catch (e) {
            console.error("Failed to load conversations", e);
        }
    };

    const handleIncomingMessage = (msg: Message) => {
        // If active conversation matches, append to messages
        if (activeConversation && msg.conversation === activeConversation._id) {
            activeMessages = [...activeMessages, msg];
            scrollToBottom();
        }

        // Update conversation list lastMessage
        const convIndex = conversations.findIndex(
            (c) => c._id === msg.conversation,
        );
        if (convIndex > -1) {
            const conv = conversations[convIndex];
            // Update lastMessage - need to be careful with types if lastMessage is populated vs ObjectId
            // Assuming msg is Message object
            conv.lastMessage = msg;
            // Move to top
            const otherConvs = conversations.filter((c) => c._id !== conv._id);
            conversations = [conv, ...otherConvs];
        } else {
            // New conversation initiated by someone else? Reload list
            loadConversations();
        }
    };

    const selectConversation = async (conv: Conversation) => {
        activeConversation = conv;
        try {
            activeMessages = await api<Message[]>(
                "GET",
                `/chat/conversations/${conv._id}/messages`,
            );
            scrollToBottom();
        } catch (e) {
            console.error("Failed to load messages", e);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConversation) return;

        // Find recipient
        const me = get(authStore).user;
        if (!me) return;
        const recipient = activeConversation.participants.find(
            (p) => p._id !== me._id,
        );
        if (!recipient) return;

        const socket = get(socketStore);
        if (socket) {
            socket.emit("sendMessage", {
                recipientId: recipient._id,
                content: messageInput,
            });
            messageInput = "";
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            searchResults = [];
            return;
        }
        try {
            searchResults = await api<User[]>("GET", `/users?q=${searchQuery}`);
        } catch (e) {
            console.error(e);
        }
    };

    const startChat = async (user: User) => {
        try {
            // Create conversation
            const conv = await api<Conversation>(
                "POST",
                "/chat/conversations",
                {
                    recipientId: user._id,
                },
            );
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
    };

    const getOtherUser = (conv: Conversation) => {
        const me = get(authStore).user;
        if (!me) return { username: "Unknown" } as User;
        const other = conv.participants.find((p) => p._id !== me._id);
        return other || ({ username: "Unknown" } as User);
    };

    // Lifecycle
    onMount(async () => {
        // Auth check
        if (!get(authStore).isAuthenticated) {
            goto("/login");
            return;
        }

        const socket = initSocket();
        if (socket) {
            socket.on("receiveMessage", (msg: Message) => {
                handleIncomingMessage(msg);
            });
        }

        await loadConversations();
    });

    onDestroy(() => {
        disconnectSocket();
    });
</script>

<div class="container">
    <div class="sidebar">
        <div class="header">
            <h2>{$_("app.title")}</h2>
            <button
                data-testid="new-chat-button"
                onclick={() => (showSearch = !showSearch)}
            >
                {showSearch ? $_("chat.select_chat") : $_("chat.new_chat")}
            </button>
        </div>

        <StoriesBar />

        {#if showSearch}
            <div class="search-area">
                <input
                    data-testid="search-input"
                    bind:value={searchQuery}
                    oninput={handleSearch}
                    placeholder={$_("chat.search_placeholder")}
                />
                <div class="results">
                    {#each searchResults as user}
                        <button
                            class="result-item"
                            data-testid="user-result-{user.username}"
                            onclick={() => startChat(user)}
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
                        onclick={() => selectConversation(conv)}
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
                                {conv.lastMessage?.content ||
                                    $_("chat.offline")}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="main">
        {#if activeConversation}
            <div class="chat-header" data-testid="chat-header">
                {getOtherUser(activeConversation)?.username}
            </div>
            <div class="message-list" id="message-list">
                {#each activeMessages as msg}
                    <div
                        class="message"
                        class:own={getSenderId(msg) === $authStore.user?._id}
                        data-testid="message-bubble"
                    >
                        <div class="bubble">
                            {#if getSenderId(msg) !== $authStore.user?._id}
                                <div class="sender-name">
                                    {getSenderName(msg)}
                                </div>
                            {/if}
                            {msg.content}
                        </div>
                    </div>
                {/each}
            </div>
            <div class="input-area">
                <input
                    data-testid="message-input"
                    bind:value={messageInput}
                    onkeydown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={$_("chat.type_message")}
                />
                <button data-testid="send-button" onclick={handleSendMessage}
                    >{$_("chat.send")}</button
                >
            </div>
        {:else}
            <div class="empty-state">
                {$_("chat.select_chat")}
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        display: flex;
        height: calc(100vh - 64px - 4rem); /* Navbar height + padding */
        border: 1px solid var(--border-color);
        background: var(--surface-color);
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    .sidebar {
        width: 320px;
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        background: #f9fafb;
    }
    .header {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--surface-color);
    }
    .header h2 {
        font-size: 1.1rem;
        font-weight: 600;
    }
    .search-area {
        padding: 1rem;
        background: var(--surface-color);
    }
    .results {
        margin-top: 0.5rem;
        border: 1px solid var(--border-color);
        background: var(--surface-color);
        border-radius: 0.5rem;
        box-shadow: var(--shadow-sm);
        max-height: 200px;
        overflow-y: auto;
    }
    .result-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        width: 100%;
        text-align: left;
        border: none;
        background: none;
        font-size: 0.9rem;
        color: var(--text-main); /* Fix white text on white bg */
    }
    .result-item:hover {
        background: var(--bg-color);
    }
    .conversation-list {
        flex: 1;
        overflow-y: auto;
    }
    .conversation-item {
        display: flex;
        padding: 1rem;
        cursor: pointer;
        border: none;
        border-bottom: 1px solid var(--border-color);
        background: transparent;
        width: 100%;
        text-align: left;
        align-items: center;
        transition: background-color 0.2s;
    }
    .conversation-item:hover {
        background: #f3f4f6;
    }
    .conversation-item.active {
        background: #eff6ff; /* Light blue */
        border-right: 3px solid var(--primary);
    }
    .avatar {
        width: 48px;
        height: 48px;
        background: #e0e7ff; /* Indigo 100 */
        color: var(--primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        font-weight: 600;
        font-size: 1.1rem;
        flex-shrink: 0;
    }
    .details {
        flex: 1;
        overflow: hidden;
    }
    .name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: var(--text-main);
    }
    .last-message {
        color: var(--text-secondary);
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--surface-color);
    }
    .chat-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        font-size: 1.1rem;
        background: var(--surface-color);
        color: var(--text-main);
    }
    .message-list {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: #f9fafb;
    }
    .message {
        display: flex;
        width: 100%;
    }
    .message.own {
        justify-content: flex-end;
    }
    .bubble {
        padding: 0.75rem 1.25rem;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 1.25rem 1.25rem 1.25rem 0;
        max-width: 65%;
        position: relative;
        word-wrap: break-word;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        color: var(--text-main);
        line-height: 1.5;
    }
    .message.own .bubble {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 1.25rem 1.25rem 0 1.25rem;
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
    }
    .sender-name {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
        margin-left: 0.5rem;
    }
    .input-area {
        padding: 1.25rem;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 0.75rem;
        background: var(--surface-color);
        align-items: center;
    }
    input {
        flex: 1;
        padding: 0.875rem 1.25rem;
        border: 1px solid var(--border-color);
        border-radius: 9999px; /* Pill shape */
        outline: none;
        font-size: 0.95rem;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
        background: #f9fafb;
    }
    input:focus {
        border-color: var(--primary);
        background: white;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    button {
        padding: 0.75rem 1.5rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }
    button:hover {
        background: var(--primary-hover);
    }
    .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        background: #f9fafb;
    }
    .empty-state::before {
        content: "💬";
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
</style>
