export const mockProfile = {
  id: "demo_user_123",
  display_name: "Demo User",
};

export const mockUsers = [
  { id: "mock_host_1", displayName: "Alice (Demo)" },
  { id: "mock_host_2", displayName: "Bob (Demo)" },
  { id: "mock_host_3", displayName: "Charlie (Demo)" }
];

export const mockIntersectionTracks = [
  {
    id: "1",
    name: "Bohemian Rhapsody",
    artists: [{ name: "Queen" }],
    album: { name: "A Night At The Opera", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bf25a" }] },
    uri: "spotify:track:1"
  },
  {
    id: "2",
    name: "Hotel California",
    artists: [{ name: "Eagles" }],
    album: { name: "Hotel California", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734620f4c9fb607b22fce63b65" }] },
    uri: "spotify:track:2"
  },
  {
    id: "3",
    name: "Stairway to Heaven",
    artists: [{ name: "Led Zeppelin" }],
    album: { name: "Led Zeppelin IV", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69" }] },
    uri: "spotify:track:3"
  },
  {
    id: "4",
    name: "Billie Jean",
    artists: [{ name: "Michael Jackson" }],
    album: { name: "Thriller", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734121faee8df82c506cb8e27a" }] },
    uri: "spotify:track:4"
  },
  {
    id: "5",
    name: "Smells Like Teen Spirit",
    artists: [{ name: "Nirvana" }],
    album: { name: "Nevermind", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf" }] },
    uri: "spotify:track:5"
  }
];

export const mockHistory = [
  {
    callerId: "demo_user_123",
    callerDisplayName: "Demo User",
    otherUserId: "mock_host_1",
    otherUserDisplayName: "Alice (Demo)",
    timestamp: Date.now() - 86400000, // 1 day ago
    count: 5,
    tracks: mockIntersectionTracks
  }
];
