const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your HTML files

app.get('/api/search/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // 1. Keyword Search: https://users.roblox.com/v1/users/search?keyword={username}
        const searchRes = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`);
        
        if (!searchRes.data.data.length) return res.status(404).json({ error: "No user found" });
        const userId = searchRes.data.data[0].id;

        // 2. Parallel Requests for speed
        const [details, presence, thumb] = await Promise.all([
            // https://users.roblox.com/v1/users/{userId}
            axios.get(`https://users.roblox.com/v1/users/${userId}`),
            // https://presence.roblox.com/v1/presence/users
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] }),
            // https://thumbnails.roblox.com/v1/users/avatar-headshot
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`)
        ]);

        res.json({
            id: userId,
            name: details.data.name,
            displayName: details.data.displayName,
            bio: details.data.description,
            status: presence.data.userPresences[0].userPresenceType,
            location: presence.data.userPresences[0].lastLocation,
            image: thumb.data.data[0].imageUrl
        });

    } catch (err) {
        res.status(500).json({ error: "Roblox API Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
