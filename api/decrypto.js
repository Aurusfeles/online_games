const bodyParser = require('body-parser')
const app = require('express')()
const socket = require('socket.io')

const toolbox = require('../assets/js/toolbox')

app.use(bodyParser.json());

var games = {
}

let server = null
let io = null

function get_next_team(game, current_team) {
    let current_team_id = game.open_data.teams[current_team].id;
    let first_team;
    for (const team in game.open_data.teams) {
        if (game.open_data.teams[team].id == 0) {
            first_team = team;
        }
        if (game.open_data.teams[team].id == current_team_id + 1) {
            return team;
        }
    }
    return first_team;
}


function get_next_player_index(team) {
    console.log(team)
    if (team.current_player_index == team.players.length - 1) {
        return 0;
    }
    return team.current_player_index + 1;
}

function everyone_ready(game) {
    for (const team in game.open_data.teams) {
        for (const player of game.open_data.teams[team].players) {
            if (!player.ready) {
                console.log("not ready!")
                return false
            }
        }
    }
    console.log("all ready!!!")
    return true;
}


function clear_ready(game) {
    for (const team in game.open_data.teams) {
        for (let player of game.open_data.teams[team].players) {
            player.ready = false;
        }
    }
    return true;
}

function remove_player(socket) {
    for (const room of socket.rooms) {
        let game = games[room]
        if (game) {
            for (let team in game.teams) {
                for (let player_index in game.teams[team].players) {
                    if (game.teams[team].players[player_index]._id == socket.id) {
                        let player_info = { game_code: room, team: team, player: toolbox.clone(game.teams[team].players[player_index]) }
                        game.teams[team].players.splice(player_index, 1);
                        return player_info;
                    }
                }
            }
        }
    }
}


function generate_code() {
    return toolbox.shuffle([0, 1, 2, 3]).slice(0, 3);
}


function change_data_for_all(io, game, path, key, value) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj[key] = value;
        io.to(game.open_data.code).emit('change_data', { path: path, key: key, value: value });
        return true;
    }
    return false;
}

function add_element_for_all(io, game, path, new_element) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj.push(new_element);
        io.to(game.open_data.code).emit('add_element', { path: path, element: new_element });
        return true;
    }
    return false;
}

function delete_element_for_all(io, game, path, element_index) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj.splice(element_index, 1);
        io.to(game.open_data.code).emit('delete_element', { path: path, element: element_index });
        return true;
    }
    return false;
}

function change_data_for_team(io, game, team, path, key, value) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj[key] = value;
        io.to(game.open_data.code + team).emit('change_data', { path: path, key: key, value: value });
        return true;
    }
    return false;
}

function add_element_for_team(io, game, team, path, new_element) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj.push(new_element);
        io.to(game.open_data.code + team).emit('add_element', { path: path, element: new_element });
        return true;
    }
    return false;
}

function delete_element_for_team(io, game, team, path, element_index) {
    let obj = toolbox.resolve_path(game.open_data, path);
    if (obj) {
        obj.splice(element_index, 1);
        io.to(game.open_data.code + team).emit('delete_element', { path: path, element: element_index });
        return true;
    }
    return false;
}


function every_clues_exposed(game) {
    for (const team in game.open_data.teams) {
        if (game.open_data.teams[team].current_code.length == 0) {
            return false
        }
    }
    return true;
}

function reset_round_data(game) {
    for (const team in game.open_data.teams) {
        change_data_for_all(io, game, ".teams." + team, "current_code", []);
        change_data_for_all(io, game, ".teams." + team, "current_guess", []);
        change_data_for_all(io, game, ".teams." + team, "current_clues", []);
        game.secret_data.teams[team].current_code = [];
        game.secret_data.teams[team].current_guess = [];
        for (const player of game.secret_data.teams[team].players) {
            player.current_guess = [];
        }
    }
    return true;
}

function correct_guess(guess, code) {
    for (let i = 0; i < code.length; i++) {
        if (code[i] != guess[i]) {
            return false;
        }
    }
    return true;
}

function expose_team_code(io, game, team) {
    change_data_for_all(io, game, ".teams." + team, "current_code", game.secret_data.teams[team].current_code);
    for (let i = 0; i < game.secret_data.teams[team].current_code.length; i++) {
        game.open_data.teams[team].clues[game.secret_data.teams[team].current_code[i]].push(game.open_data.teams[team].current_clues[i]);
    }
}


function all_teams_have_guessed(game) {
    for (const team in game.secret_data.teams) {
        if (game.secret_data.teams[team].current_guess.length == 0) {
            return false;
        }
    }
    return true;
}

function check_state(game) {
    console.log("state", game.open_data.state)
    switch (game.open_data.state) {
        case "start":
            if (everyone_ready(game)) {


                // A FAIRE: Vérifier que toutes les équipes ont au moins 2 joueurs                
                // A FAIRE: faire un mode 3 joueurs (une équipe de 2, et un joueur seul qui ne fait que deviner le code)                        


                // entering "first_clues_making" state
                change_data_for_all(io, game, ".", "state", "first_clues_making");

                for (const team in game.open_data.teams) {
                    if (game.open_data.teams[team].players.length > 0) {
                        let current_player_index = game.open_data.teams[team].current_player_index;
                        change_data_for_all(io, game, ".teams." + team + ".players[" + current_player_index + "]", "ready", false);
                        io.to(game.open_data.teams[team].players[current_player_index]._id).emit('code', generate_code());
                    }
                }
            }
            break;
        case "first_clues_making":
            if (everyone_ready(game)) {
                clear_ready(game);
                for (const team in game.open_data.teams) {
                    let current_player_index = game.open_data.teams[team].current_player_index;
                    change_data_for_all(io, game, ".teams." + team + ".players[" + current_player_index + "]", "ready", true);
                }

                // entering "first_clues_guessing" state
                change_data_for_all(io, game, ".", "state", "first_clues_guessing");
            }
            break;
        case "first_clues_guessing":
            process_guesses(game);
            if (all_teams_have_guessed(game)) {
                for (const team in game.secret_data.teams) {
                    expose_team_code(io, game, team);
                    change_data_for_all(io, game, ".teams." + team, "current_guess", game.secret_data.teams[team].current_guess);
                    if (!correct_guess(game.secret_data.teams[team].current_guess, game.secret_data.teams[team].current_code)) {
                        change_data_for_all(io, game, ".teams." + team, "bad_tokens", game.open_data.teams[team].bad_tokens + 1);
                    }
                }
                change_data_for_all(io, game, ".", "state", "first_results");
                clear_ready(game);

            }
            break;


        case "first_results":
        case "end_of_round_results":
            if (everyone_ready(game)) {
                reset_round_data(game);
                change_data_for_all(io, game, ".", "first_team_to_expose", get_next_team(game.open_data.first_team_to_expose));
                change_data_for_all(io, game, ".", "state", "clues_making");
                for (const team in game.open_data.teams) {
                    let next = get_next_player_index(game.open_data.teams[team]);
                    change_data_for_all(io, game, ".teams." + team, "current_player_index", next);
                    change_data_for_all(io, game, ".teams." + team + ".players[" + next + "]", "ready", false);
                    io.to(game.open_data.teams[team].players[next]._id).emit('code', generate_code());
                }
            }
            break;

        case "results":
            if (everyone_ready(game)) {
                change_data_for_all(io, game, ".", "state", "clues_guessing");

                let next_team = get_next_team(game, game.open_data.current_team);
                let current_player_index = game.open_data.teams[next_team].current_player_index;
                change_data_for_all(io, game, ".teams." + next_team + ".players[" + current_player_index + "]", "ready", true);
                change_data_for_all(io, game, ".", "current_team", next_team);
            }
            break;

        case "clues_making":
            if (everyone_ready(game)) {
                clear_ready(game);
                change_data_for_all(io, game, ".", "state", "clues_guessing");
                let current_player_index = game.open_data.teams[game.first_team_to_expose].current_player_index;
                change_data_for_all(io, game, ".teams." + game.open_data.first_team_to_expose + ".players[" + current_player_index + "]", "ready", true);
                change_data_for_all(io, game, ".", "current_team", game.open_data.first_team_to_expose);

            }
            break;

        case "clues_guessing":
            if (all_teams_have_guessed(game)) {
                if (every_clues_exposed(game)) {
                    process_guesses(game);  // A faire!! code is revealed, clues are put in correct table columns, score is update
                    change_data_for_all(io, game, ".", "state", "end_of_round_results");
                    clear_ready(game);
                }
                else {
                    change_data_for_all(io, game, ".", "state", "results");
                    clear_ready(game);

                }
            }
            break;
    }
}

app.post('/create_game', (req, res) => {
    // Création du serveur, et gestion des différents messages
    if (!server) {
        server = res.connection.server;
        io = socket(server);

        io.on('connection', function (socket) {
            console.log('Made socket connection');
            socket.on('disconnecting', reason => {
                console.log("disconnecting:", reason);
                let player_info = remove_player(socket);
                if (player_info) {
                    player_info.reason = reason;
                    console.log(player_info);
                    socket.to(player_info.game_code).emit('player_left', player_info)
                }
            });

            socket.on("game_data", (msg) => {
                console.log("game_data");
                let game = games[msg.game_code];
                if (game) {
                    socket.emit('game_data', game.open_data);
                }
            });

            socket.on("change_data", (msg) => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("change", msg);
                    switch (msg.destination) {
                        case "secret":
                            let obj = toolbox.resolve_path(game.secret_data, msg.path);
                            if (obj) {
                                obj[msg.key] = msg.value;
                            }
                            break;

                        case "team":
                            if (change_data_for_team(io, game, msg.team, msg.path, msg.key, msg.value)) {
                                check_state(game);
                            }
                            break;

                        case "all":
                            if (change_data_for_all(io, game, msg.path, msg.key, msg.value)) {
                                check_state(game);
                            }
                            break;
                    }
                }
            });

            socket.on("add_element", (msg) => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("add", msg);
                    switch (msg.destination) {
                        case "secret":
                            let obj = toolbox.resolve_path(game.secret_data, msg.path);
                            if (obj) {
                                obj.push(msg.new_element);
                            }
                            break;
                        case "team":
                            if (add_element_for_team(io, game, team, msg.path, msg.new_element)) {
                                check_state(game);
                            }
                            break;
                        case "all":
                            if (add_element_for_all(io, game, msg.path, msg.new_element)) {
                                check_state(game);
                            }
                            break;
                    }
                }
            });

            socket.on("delete_element", (msg) => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("delete", msg);

                    switch (msg.destination) {
                        case "secret":
                            let obj = toolbox.resolve_path(game.secret_data, msg.path);
                            if (obj) {
                                obj.splice(msg.element_index, 1);
                            }
                            break;
                        case "team":
                            if (delete_element_for_team(io, game, team, msg.path, msg.element_index)) {
                                check_state(game);
                            }
                            break;
                        case "all":
                            if (delete_element_for_all(io, game, msg.path, msg.element_index)) {
                                check_state(game);
                            }
                            break;
                    }
                }
            });

            socket.on('join_game', msg => {
                socket.join(msg.game_code);// Room for the game
                console.log("join");
                let game = games[msg.game_code];
                if (game) {
                    let new_player = msg.player;
                    if (msg.team == "idc") {
                        let nb_players = 9999;
                        for (let team in game.open_data.teams) {
                            if (game.open_data.teams[team].players.length < nb_players) {
                                msg.team = team;
                                nb_players = game.open_data.teams[team].players.length
                            }
                        }
                    }
                    socket.join(msg.game_code + msg.team); // Room for the team
                    new_player._id = socket.id
                    add_element_for_all(io, game, ".teams." + msg.team + ".players", new_player)
                    game.secret_data.teams[msg.team].players.push(new_player);
                    console.log("join_emit", { player_index: game.open_data.teams[msg.team].players.length - 1, team: msg.team });
                    socket.emit('personal_data', { player_index: game.open_data.teams[msg.team].players.length - 1, team: msg.team, word_list: game.secret_data.teams[msg.team].word_list });

                }
            });

            socket.on('disconnect', () => console.log('disconnected'));
        })
    }
    let new_game_code = toolbox.generate_game_code()
    let word_list = toolbox.generate_word_list(8);

    games[new_game_code] = {
        open_data: {
            code: new_game_code,
            started_on: Date.now(),
            state: "start",
            current_team: "white",
            first_team_to_expose: "white",
            teams: {
                white: {
                    id: 0,
                    clues: [[], [], [], []],
                    good_tokens: 0,
                    bad_tokens: 0,
                    players: [],
                    current_player_index: 0,
                    current_guess: [],
                    current_code: [],
                    current_clues: [],

                },
                black: {
                    id: 1,
                    clues: [[], [], [], []],
                    good_tokens: 0,
                    bad_tokens: 0,
                    players: [],
                    current_player_index: 0,
                    current_guess: [],
                    current_code: [],
                    current_clues: [],
                }
            },
            chat: []
        },
        secret_data: {
            teams: {
                white: {
                    word_list: word_list.slice(0, 4),
                    current_code: [],
                    chat: [],
                    players: [],
                },
                black: {
                    word_list: word_list.slice(4, 8),
                    current_code: [],
                    chat: [],
                    players: [],
                }
            }
        }
    };

    res.json({ game_code: new_game_code })
})

module.exports = app