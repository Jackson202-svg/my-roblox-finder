const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public')); // Serves your index.html and images

app.get('/api/search/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // 1. Search for User ID
        const searchRes = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`);
        if (!searchRes.data.data.length) return res.status(404).json({ error: "User not found" });
        const userId = searchRes.data.data[0].id;

        // 2. Fetch Details, Presence, and Thumbnail in parallel
        const [details, presence, thumb] = await Promise.all([
            axios.get(`https://users.roblox.com/v1/users/${userId}`),
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] }),
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`)
        ]);

        const data = presence.data.userPresences[0];

        res.json({
            id: userId,
            username: details.data.name,
            displayName: details.data.displayName,
            bio: details.data.description,
            created: new Date(details.data.created).toLocaleDateString(),
            status: data.userPresenceType, // 0: Offline, 1: Online, 2: InGame
            location: data.lastLocation || "Private",
            pfp: thumb.data.data[0].imageUrl
        });
    } catch (err) {
        res.status(500).json({ error: "Roblox API Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
