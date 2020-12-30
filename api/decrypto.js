const bodyParser = require('body-parser')
const app = require('express')()
const socket = require('socket.io')

const toolbox = require('./toolbox.js')

app.use(bodyParser.json());

var games = {
}

let server = null
let io = null


function next_player(team) {
    team.next_to_play++;
    if (team.next_to_play == team.players.length) {
        team.next_to_play = 0;
    }
    return team.players[next_to_play]._id;
}

function get_code_dispatching_list(game) {
    let code_dispatching_list = []
    for (const team in game.teams) {
        code_dispatching_list.push({ code: generate_code(), socketId: next_player(game.teams[team]) });
    }
    return code_dispatching_list;
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

app.post('/create_game', (req, res) => {
    // Création du serveur, et gestion des différents messages
    if (!server) {
        server = res.connection.server;
        io = socket(server);

        io.on('connection', function (socket) {
            console.log('Made socket connection');
            socket.on('join_game', msg => {
                socket.join(msg.game_code);
                let game = games[msg.game_code];
                if (game) {
                    if (msg.team == "idc") {
                        let nb_players = 9999;
                        for (let team in game.teams) {
                            if (game.teams[team].players.length < nb_players) {
                                msg.team = team;
                                nb_players = game.teams[team].players.length
                            }
                        }
                    }
                    socket.emit('game_data', { game_code: msg.game_code, team: msg.team, game_data: team_only_clone(game, msg.team) });
                    msg.player._id = socket.id
                    game.teams[msg.team].players.push(msg.player);
                    io.to(msg.game_code).emit('new_player', { team: msg.team, player: msg.player });
                }
            });
            socket.on('msg_global', msg => {
                let game = games[msg.game_code];
                if (game) {
                    game.chat.push(msg.msg);
                    io.to(msg.game_code).emit('msg_global', msg.msg);
                }
            });
            socket.on('msg_team', msg => {
                let game = games[msg.game_code];
                if (game) {
                    game.team[msg.team].chat.push(msg.msg);
                    io.to(msg.game_code).emit('msg_team', { team: msg.team, msg: msg.msg });
                }
            });
            socket.on('ready', msg => {
                let game = games[msg.game_code];
                if (game) {
                    player(game.team[msg.team], msg.player).ready = true;
                    if (everyone_ready(game)) {
                        clear_ready(game);
                        // A FAIRE: Vérifier que toutes les équipes ont au moins 2 joueurs
                        // A FAIRE: faire un mode 3 joueurs (une équipe de 2, et un joueur seul qui ne fait que deviner le code)
                        let code_dispatching_list = get_code_dispatching_list(game);
                        for (clue_set of code_dispatching_list) {
                            io.to(clue_set.socketId).emit('code', clue_set.code);
                        }
                    }
                }
            });
            socket.on('clues', msg => {
                let game = games[msg.game_code];
                if (game) {
                    game.teams[msg.team].clues[game.teams[msg.team].clues.length - 1].texts = msg.texts;
                    io.to(msg.game_code).emit('clues', { team: msg.team, texts: msg.texts });
                }

            });
            socket.on('disconnect', () => console.log('disconnected'));
        })
    }
    let new_game_code = toolbox.generate_game_code()
    let word_list = toolbox.generate_word_list(8);

    games[new_game_code] = {
        started_on: Date.now(),
        teams: {
            white: {
                words: word_list.slice(0, 4),
                clues: [],
                good_tokens: 0,
                bad_tokens: 0,
                players: [],
                chat: [],
                next_to_play: -1
            },
            black: {
                words: word_list.slice(4, 8),
                clues: [],
                good_tokens: 0,
                bad_tokens: 0,
                players: [],
                chat: [],
                next_to_play: -1
            }
        },
        chat: []
    };

    res.json({ game_code: new_game_code })
})

module.exports = app