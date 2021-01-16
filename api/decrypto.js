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
    let current_team_id = game.teams[current_team].id;
    let first_team;
    for (const team in game.teams) {
        if (game.teams[team].id == 0) {
            first_team = team;
        }
        if (game.teams[team].id == current_team_id + 1) {
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
    for (const team in game.teams) {
        for (const player of game.teams[team].players) {
            if (!player.ready) {
                return false
            }
        }
    }
    return true;
}


function clear_ready(game) {
    for (const team in game.teams) {
        for (let player of game.teams[team].players) {
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


function change_data_for_all(io, game, path, key, new_value) {
    let obj = toolbox.resolve_path(game, path);
    if (obj) {
        obj[key] = new_value;
        io.to(game.code).emit('change_data', { path: path, key: key, new_value: new_value });
        return true;
    }
    return false;
}

function add_element_for_all(io, game, path, new_element) {
    let obj = toolbox.resolve_path(game, path);
    if (obj) {
        obj.push(new_element);
        io.to(game.code).emit('add_element', { path: path, element: new_element });
        return true;
    }
    return false;
}

function delete_element_for_all(io, game, path, element_index) {
    let obj = toolbox.resolve_path(game, path);
    if (obj) {
        obj.splice(element_index, 1);
        io.to(game.code).emit('delete_element', { path: path, element: element_index });
        return true;
    }
    return false;
}

function every_clues_exposed(game) {
    for (const team in game.teams) {
        if (!game.teams[team].clues_exposed) {
            return false
        }
    }
    return true;
}

function process_guesses(game) {
    return true;

}

function check_state(game) {
    switch (game.state) {
        case "start":
            if (everyone_ready(game)) {


                // A FAIRE: Vérifier que toutes les équipes ont au moins 2 joueurs                
                // A FAIRE: faire un mode 3 joueurs (une équipe de 2, et un joueur seul qui ne fait que deviner le code)                        


                // entering "first_clues_making" state
                change_data_for_all(io, game, ".", "state", "first_clues_making");

                for (const team in game.teams) {
                    if (game.teams[team].players.length > 0) {
                        let current_player_index = game.teams[team].current_player_index;
                        change_data_for_all(io, game, ".teams." + team + ".players[" + current_player_index + "]", "ready", false);
                        io.to(game.teams[team].players[current_player_index]._id).emit('code', generate_code());
                    }
                }
            }
            break;
        case "first_clues_making":
            if (everyone_ready(game)) {
                clear_ready(game);
                for (const team in game.teams) {
                    let current_player_index = game.teams[team].current_player_index;
                    change_data_for_all(io, game, ".teams." + team + ".players[" + current_player_index + "]", "ready", true);
                }

                // entering "first_clues_guessing" state
                change_data_for_all(io, game, ".", "state", "first_clues_guessing");
            }
            break;
        case "first_clues_guessing":
            if (everyone_ready(game)) {
                change_data_for_all(io, game, ".", "state", "first_results");
                clear_ready(game);
                process_guesses(game);  // A faire!! code is revealed, clues are put in correct table columns, score is update
            }
            break;


        case "first_results":
        case "end_of_round_results":
            if (everyone_ready(game)) {
                change_data_for_all(io, game, ".", "first_team_to_expose", get_next_team(game.first_team_to_expose));
                change_data_for_all(io, game, ".", "state", "clues_making");
                for (const team in game.teams) {
                    let next = get_next_player_index(game.teams[team]);
                    change_data_for_all(io, game, ".teams." + team, "current_player_index", next);
                    change_data_for_all(io, game, ".teams." + team + ".players[" + next + "]", "ready", false);
                    io.to(game.teams[team].players[next]._id).emit('code', generate_code());
                }
            }
            break;

        case "results":
            if (everyone_ready(game)) {
                change_data_for_all(io, game, ".", "state", "clues_guessing");

                let next_team = get_next_team(game, game.current_team);
                let current_player_index = game.teams[next_team].current_player_index;
                change_data_for_all(io, game, ".teams." + next_team + ".players[" + current_player_index + "]", "ready", true);
                change_data_for_all(io, game, ".", "current_team", next_team);
            }
            break;

        case "clues_making":
            if (everyone_ready(game)) {
                clear_ready(game);
                change_data_for_all(io, game, ".", "state", "clues_guessing");
                let current_player_index = game.teams[game.first_team_to_expose].current_player_index;
                change_data_for_all(io, game, ".teams." + game.first_team_to_expose + ".players[" + current_player_index + "]", "ready", true);
                change_data_for_all(io, game, ".", "current_team", game.first_team_to_expose);

            }
            break;

        case "clues_guessing":
            if (every_clues_exposed(game)) {
                process_guesses(game);  // A faire!! code is revealed, clues are put in correct table columns, score is update
                change_data_for_all(io, game, ".", "state", "end_of_round_results");
                clear_ready(game);
            }
            else {
                change_data_for_all(io, game, ".", "state", "results");
                clear_ready(game);

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
                    if (change_data_for_all(io, game.open_data, msg.path, msg.key, msg.new_value)) {
                        check_state(game.open_data);
                    }
                }
            });

            socket.on("add_element", (msg) => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("add", msg);
                    if (add_element_for_all(io, game.open_data, msg.path, msg.new_element)) {
                        check_state(game.open_data);
                    }
                }
            });

            socket.on("delete_element", (msg) => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("delete", msg);
                    if (delete_element_for_all(io, game.open_data, msg.path, msg.element_index)) {
                        check_state(game.open_data);
                    }
                }
            });

            socket.on('join_game', msg => {
                socket.join(msg.game_code);
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
                    console.log("join_emit", { player_index: game.open_data.teams[msg.team].players.length - 1, team: msg.team });
                    new_player._id = socket.id
                    add_element_for_all(io, game.open_data, ".teams." + msg.team + ".players", new_player)
                    socket.emit('personal_data', { player_index: game.open_data.teams[msg.team].players.length - 1, team: msg.team, word_list: game.secret_data.teams[msg.team].word_list });

                }
            });

            socket.on('clue_set', msg => {
                let game = games[msg.game_code];
                if (game) {
                    change_data_for_all(io, game.open_data, ".teams." + msg.team + ".players." + msg.player_index, "ready", true);
                    change_data_for_all(io, game.open_data, ".teams." + msg.team, "current_clues", msg.texts);
                    game.secret_data.teams[msg.team].current_code = msg.code;
                    check_state(game.open_data);

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
                    clues_exposed: false,
                    clues: [],
                    good_tokens: 0,
                    bad_tokens: 0,
                    players: [],
                    current_player_index: 0
                },
                black: {
                    id: 1,
                    clues_exposed: false,
                    clues: [],
                    good_tokens: 0,
                    bad_tokens: 0,
                    players: [],
                    current_player_index: 0
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
                },
                black: {
                    word_list: word_list.slice(4, 8),
                    current_code: [],
                    chat: [],
                }
            }
        }
    };

    res.json({ game_code: new_game_code })
})

module.exports = app