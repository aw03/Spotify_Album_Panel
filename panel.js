const clientId =  "fa7e3da5eaf04cafae56a7e91d657d50";
const redirectUri = "http://localhost:3000/panel";
let token;

window.addEventListener("DOMContentLoaded", async () => {
  const code = new URLSearchParams(window.location.search).get("code");
  const codeVerifier = localStorage.getItem("code_verifier");

  if (!code || !codeVerifier) {
    document.getElementById("token-display").textContent = "Missing code or verifier.";
    return;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }) 
  });

  token = await response.json();
  document.getElementById("token-display").textContent = JSON.stringify(token, null, 2);

  recent_tracks = await getRecentlyPlayed(token);
  document.getElementById("recently-played-tracks").textContent = JSON.stringify(recent_tracks, null, 2);

  
});

async function getRecentlyPlayed(token) {
    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.get(access_token)}`
      }
    });
  
    if (!response.ok) {
    //  
        document.getElementById("recently-played-tracks").textContent = response.error.message;
        throw new Error(`Spotify API error: ${response.status}`);
        // return response.error
    }
  
    const data = await response.json();
    return data;
  }