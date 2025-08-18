const clientId =  "fa7e3da5eaf04cafae56a7e91d657d50";
const redirectUri = "http://localhost:3000/panel";
let token;
let recent_tracks;
const image_limit = 36;


window.addEventListener("DOMContentLoaded", async () => {
  const code = new URLSearchParams(window.location.search).get("code");
  const codeVerifier = localStorage.getItem("code_verifier");

  if (!code || !codeVerifier) {
    document.getElementById("recently-played-tracks").textContent += "Missing code or verifier.";
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

  if (!response.ok)
  {
  
    document.getElementById("recently-played-tracks").textContent += "Could not fetch token\n";
    document.getElementById("recently-played-tracks").textContent += `Error Number: ${token.error.status}, Error Message: ${token.error.message}\n`;
    return;
  }
  makePanel();
  
  // let raw_tracks = await fetchRecentTracks(image_limit);
  // recent_tracks = parseRecentTracks(raw_tracks);
  // displayImages(recent_tracks);

});

async function makePanel() {
  isLoading = false;
  let raw_tracks = await fetchRecentTracks(image_limit);
  recent_tracks = parseRecentTracks(raw_tracks);
  await displayImages(recent_tracks);
  setTimeout(makePanel, 60000);
}

async function fetchRecentTracks(limit, before = 0) {
    let url;
    if (before == 0) {
      url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`;
    }
    else
    {
      url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}&before=${before}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.access_token}`
      }
    });
  
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.status == 401) { 
            if (!(await refreshToken()))
            {
              document.getElementById("recently-played-tracks").textContent += "Could not refresh token\n";
              document.getElementById("recently-played-tracks").textContent += `Error Number: ${errorData.error.status}, Error Message ${errorData.error.message}`;
              return;
            }
            return await fetchRecentTracks(limit); // THIS PART IS SPOOKY BE CAREFULL
        }
        document.getElementById("recently-played-tracks").textContent += `Error Number: ${errorData.error.status}, Error Message: ${errorData.error.message}`;
        return;
    }
  
    const data = await response.json();
    return data;
  }

const parseRecentTracks = raw_tracks => {
    if (typeof raw_tracks == "undefined")
    {
      return [];
    }
    let raw_tracks_list = raw_tracks.items;
    let tracks = raw_tracks_list.map(hist => ({"id" : hist.track.album.id , 
    "img_url": hist.track.album.images[0].url, "height":hist.track.album.images[0].height,
    "width":hist.track.album.images[0].width }));
    return tracks;
}

async function displayImages(tracks) {
    const container = document.getElementById("image-container");
    container.innerHTML = "";

    for (const track of tracks) {
      const img = document.createElement("img");
      img.src = track.img_url;
      img.alt = track.id;
      img.height = 250;
      img.width = 250; 
      img.classList.add("fade-in");
      container.appendChild(img);
    };

    for (const img of container.childNodes) {
      await sleep(500);
      requestAnimationFrame(() => {
        img.classList.add("visible");
      });
    }
      
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    const response_body = await fetch(url, payload);
    if (!response_body.ok)
    {
      return false;
    }

    const response = await response_body.json();

    if (response.refresh_token) {
      token = response;
    } else {
      refresh_tok = token.refresh_token;
      token = response;
      token.refresh_token = refresh_tok;
    }
    return true;
  }