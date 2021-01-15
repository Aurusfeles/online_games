const bodyParser = require('body-parser')
const app = require('express')()
const socket = require('socket.io')

const toolbox = require('../assets/js/toolbox')

app.use(bodyParser.json());

var games = {
}

let server = null
let io = null


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

function team_only_clone(game, selected_team) {
    let team_only_clone = toolbox.clone(game);
    for (const team in team_only_clone.teams) {
        if (team != selected_team) {
            delete team_only_clone.teams[team].words;
            delete team_only_clone.teams[team].chat;
        }
    }
    return team_only_clone;
}
function generate_code() {
    return toolbox.shuffle([0, 1, 2, 3]).slice(0, 3);
}


function player(team, player_name) {
    //return the player object in the team with the given player_name
    for (let player of team.players) {
        if (player.name == player_name) {
            return player;
        }
    }

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
                process_guesses(game);  // A faire!! ode is revealed, clues are put in correct table columns, score is update
            }
            break;

        case "results":
        case "first_results":
            if (everyone_ready(game)) {
                change_data_for_all(io, game, ".", "state", "clues_making");
                for (const team in game.teams) {
                    let next = get_next_player_index(game.teams[team]);
                    change_data_for_all(io, game, ".teams." + team, "current_player_index", next);
                    change_data_for_all(io, game, ".teams." + team + ".players[" + next + "]", "ready", false);
                    io.to(game.teams[team].players[next]._id).emit('code', generate_code());
                }
            }
            break;
        case "clues_making":
            if (everyone_ready(game)) {
                clear_ready(game);
                change_data_for_all(io, game, ".", "state", "clues_guessing");
                let next_team = get_next_team(game);
                if (every_team_played(game)) {
                    change_data_for_all(io, game, ".", "state", "results");
                }
                else {
                    let current_player_index = game.teams[next_team].current_player_index;
                    change_data_for_all(io, game, ".teams." + team + ".players[" + current_player_index + "]", "ready", true);
                    change_data_for_all(io, game, ".", "current_team", next_team);
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
                    player(game.open_datateams[msg.team], msg.player.name).ready = true;
                    game.open_datateams[msg.team].current_clues = msg.texts;
                    game.open_data.teams[msg.team].current_code = msg.code;

                    //A FAIRE: déterminer la prochaine équipe dont on doit deviner les indices
                    let next_team = 'white';

                    if (everyone_ready(game)) {
                        for (const team in game.teams) {
                            for (let i = 0; i < game.open_data.teams[team].players.length; i++) {
                                if (team == next_team && i == game.teams[team].current_player_index) {
                                    game.open_data.teams[team].players[i].ready = true;
                                    io.to(game.open_data.teams[team].players[i]._id).emit('waiting_for_guesses');
                                } else {
                                    game.open_data.teams[team].players[i].ready = false;
                                    io.to(game.open_data.teams[team].players[i]._id).emit('clues_to_guess', { team: next_team, clues: game.teams[next_team].current_clues });
                                }
                            }
                        }
                    }

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
            teams: {
                white: {
                    clues: [],
                    good_tokens: 0,
                    bad_tokens: 0,
                    players: [],
                    current_player_index: 0
                },
                black: {
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
                    code: [],
                    chat: [],
                },
                black: {
                    word_list: word_list.slice(4, 8),
                    code: [],
                    chat: [],
                }
            }
        }
    };

    res.json({ game_code: new_game_code })
})

module.exports = app