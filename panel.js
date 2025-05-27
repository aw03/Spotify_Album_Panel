const clientId =  "fa7e3da5eaf04cafae56a7e91d657d50";
const redirectUri = "http://localhost:3000/panel";
let token;
let recent_tracks;

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
  let raw_tracks = await getRecentlyPlayed(25);
//   document.getElementById("recently-played-tracks").textContent = JSON.stringify(raw_tracks, null, 2);
  recent_tracks = parseRecentTracks(raw_tracks)
  document.getElementById("recently-played-tracks").textContent = JSON.stringify(recent_tracks, null, 2)
});

async function getRecentlyPlayed(limit) {
    let url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.access_token}`
      }
    });
  
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.status == 401) { 
            await refreshToken();
            return await getRecentlyPlayed(limit); // THIS PART IS SPOOKY BE CAREFULL
        }
        document.getElementById("recently-played-tracks").textContent = `Error Number: ${errorData.error.status}, error message ${errorData.error.message}`;
        return;
    }
  
    const data = await response.json();
    return data;
  }

  const refreshToken = async () => {

    // refresh token that has been previously stored
    const refreshToken = JSON.stringify(token.refresh_token,null,2);
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: clientId
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
 
     if (response.refresh_token) {
       token = response;
     } else {
        refresh_tok = token.refresh_token;
        token = response;
        token.refresh_token = refresh_tok;
     }
     return;
   }

const parseRecentTracks = recent_tracks => {
    let raw_tracks_list = recent_tracks.items;
    let tracks_list = raw_tracks_list.map(hist => ({"id" : hist.track.album.id , 
    "img_url": hist.track.album.images[0].url, "height":hist.track.album.images[0].height,
    "width":hist.track.album.images[0].width }));
    return tracks_list
}
