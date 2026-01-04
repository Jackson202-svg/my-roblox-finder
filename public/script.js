const searchInput = document.getElementById('searchInput');
const resultsArea = document.getElementById('results-area');

// Autocomplete logic
searchInput.addEventListener('input', async (e) => {
    const val = e.target.value;
    if (val.length < 3) return;

    // Optional: You could build a dropdown UI here
    console.log("Searching suggestions for:", val);
    const res = await fetch(`/api/suggest/${val}`);
    const suggestions = await res.json();
    // Logic to show a list under the search bar would go here
});

async function startSearch() {
    const query = searchInput.value;
    if (!query) return;

    resultsArea.innerHTML = "Searching...";

    try {
        const response = await fetch(`/api/search/${query}`);
        const data = await response.json();

        if (data.error) {
            resultsArea.innerHTML = `<p>No results found for ${query}</p>`;
            return;
        }

        renderResult(data);
    } catch (err) {
        resultsArea.innerHTML = "Backend offline!";
    }
}

function renderResult(data) {
    resultsArea.innerHTML = `
        <div class="google-result">
            <div class="res-url">roblox.com > users > ${data.id}</div>
            <a href="#" class="res-title">${data.displayName} (@${data.username})</a>
            <div class="res-content">
                <img src="${data.pfp}" class="res-thumb">
                <div class="res-text">
                    <p><b>Member since:</b> ${data.created}</p>
                    <p><b>Bio:</b> ${data.bio || "No description provided."}</p>
                </div>
            </div>
        </div>
    `;
}
