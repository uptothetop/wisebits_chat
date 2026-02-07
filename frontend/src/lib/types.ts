export interface User {
    _id: string;
    username: string;
    email: string;
    // password is never sent to frontend
}

export interface Message {
    _id: string;
    sender: User | string; // Populated or ID
    conversation: string; // ID
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

export interface Story {
    _id: string;
    user: User;
    mediaUrl: string;
    type: 'image' | 'video';
    createdAt: string;
}

export interface UserStoryGroup {
    user: User;
    items: Story[];
}
