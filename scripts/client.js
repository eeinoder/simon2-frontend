// Client -> Backend API calls

const base_url = 'http://localhost:5050';
// TODO: change url to heroku once backend deployed

async function getLeaderboardScoresBackend(game_mode, num_buttons) {
    await fetch(`${base_url}/leaderboard/${game_mode}-${num_buttons}`)
            .then(resp => resp.json())
            .then(json => formatAndRenderScoresList(json));
}

async function addEntryLeaderboardDB(game_mode, num_buttons, user_id, score) {
    await fetch(`${base_url}/leaderboard`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
            user_id, score, game_mode, num_buttons // NOTE: names must match EXACTLY w/ how they're parsed from JSON in settings.js, etc.
        })
      }).then(resp => resp.json());
}