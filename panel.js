const clientId =  "fa7e3da5eaf04cafae56a7e91d657d50";
const redirectUri = "http://localhost:3000/panel";

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

  const token = await response.json();
  document.getElementById("token-display").textContent = JSON.stringify(token, null, 2);
});
