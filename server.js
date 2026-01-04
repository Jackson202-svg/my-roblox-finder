const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/lookup/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // 1. Search for User ID (https://users.roblox.com/v1/users/search)
        const searchRes = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`);
        
        if (!searchRes.data.data || searchRes.data.data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = searchRes.data.data[0].id;

        // 2. Multi-fetch for Details, Presence, and Thumbnails
        const [details, presence, thumb] = await Promise.all([
            // https://users.roblox.com/v1/users/{userId}
            axios.get(`https://users.roblox.com/v1/users/${userId}`),
            // https://presence.roblox.com/v1/presence/users
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] }),
            // https://thumbnails.roblox.com/v1/users/avatar-headshot
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`)
        ]);

        // 3. Construct the response
        res.json({
            id: userId,
            username: details.data.name,
            displayName: details.data.displayName,
            description: details.data.description,
            created: details.data.created,
            status: presence.data.userPresences[0].userPresenceType, // 0: Offline, 1: Online, 2: InGame
            lastLocation: presence.data.userPresences[0].lastLocation,
            pfp: thumb.data.data[0].imageUrl
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Roblox API Connection Failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
