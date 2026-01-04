const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your GitHub site to talk to this server
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Route to get all player data at once
app.get('/api/player/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // 1. Get User ID
        const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: true
        });

        if (!userRes.data.data.length) return res.status(404).json({ error: "User not found" });
        const user = userRes.data.data[0];

        // 2. Get Presence & Thumbnail in parallel (Faster)
        const [presenceRes, thumbRes] = await Promise.all([
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [user.id] }),
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`)
        ]);

        res.json({
            username: user.name,
            displayName: user.displayName,
            id: user.id,
            status: presenceRes.data.userPresences[0].userPresenceType,
            location: presenceRes.data.userPresences[0].lastLocation,
            pfp: thumbRes.data.data[0].imageUrl
        });

    } catch (err) {
        res.status(500).json({ error: "Roblox API Error" });
    }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
