async function startSearch() {
    const query = document.getElementById('searchInput').value;
    const resultsArea = document.getElementById('results-container');
    
    if (!query) return;

    resultsArea.innerHTML = '<p class="loading">Searching Roblox...</p>';
    resultsArea.style.display = 'block';

    try {
        const response = await fetch(`/api/search/${query}`);
        const data = await response.json();

        if (data.error) {
            resultsArea.innerHTML = `<p style="color:red">No results for "${query}"</p>`;
            return;
        }

        const statusColors = ['#70757a', '#00e676', '#00a2ff']; // Gray, Green, Blue
        const statusNames = ['Offline', 'Online', 'In Game'];

        resultsArea.innerHTML = `
            <div class="google-result">
                <div class="res-url">https://www.roblox.com › users › ${data.id}</div>
                <a href="https://www.roblox.com/users/${data.id}/profile" target="_blank" class="res-title">
                    ${data.displayName} (@${data.username})
                </a>
                <div class="res-content">
                    <img src="${data.pfp}" class="res-thumb">
                    <div class="res-text">
                        <p><span class="dot" style="background:${statusColors[data.status]}"></span> 
                           <b>${statusNames[data.status]}</b> — ${data.location}</p>
                        <p><b>Joined:</b> ${data.created}</p>
                        <p class="bio">${data.bio || "No bio available."}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        resultsArea.innerHTML = '<p>Error connecting to backend.</p>';
    }
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('themeBtn').innerText = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
}
