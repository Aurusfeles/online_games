const bodyParser = require('body-parser')
const app = require('express')()
const socket = require('socket.io')

var words_file = require('./fr_words.json');

app.use(bodyParser.json());

var games = {

}


let server = null
let io = null

const code_chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
]

function shuffle(arra1) {
    var ctr = arra1.length, temp, index;

    // While there are elements in the array
    while (ctr > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
        ctr--;
        // And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

function generate_game_code() {
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += code_chars[Math.floor(Math.random() * code_chars.length)]
    }
    return code;
}


function generate_word_list() {
    return shuffle(words_file).slice(0, 25)
}


function generate_word_colors(starting_color) {
    let colors = [
        "blue",
        "blue",
        "blue",
        "blue",
        "blue",
        "blue",
        "blue",
        "blue",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "white",
        "white",
        "white",
        "white",
        "white",
        "white",
        "white",
        "black",
    ]
    colors.push(starting_color)
    return shuffle(colors)
}


app.post('/create_game', (req, res) => {
    // Création du serveur, et gestion des différents messages
    if (!server) {
        server = res.connection.server;
        console.log(res.connection.server)
        io = socket(server);

        io.on('connection', function (socket) {
            console.log('Made socket connection');
            socket.on('join_game', msg => {
                let game = games[msg.game_code];
                if (game) {
                    socket.emit('game_data', { game_code: msg.game_code, game_data: games[msg.game_code] });
                }
            });
            socket.on('msg_global', msg => {
                let game = games[msg.game_code];
                if (game) {
                    game.chat.push(msg.msg);
                    io.emit('msg_global', msg.msg);
                }
            });
            socket.on('disconnect', () => console.log('disconnected'));
        })
    }
    let new_game_code = generate_game_code()
    let word_list = generate_word_list()
    let word_colors = generate_word_colors("blue")
    let words = {}

    for (let i = 0; i < 25; i++) {
        words[word_list[i]] = { "color": word_colors[i], "visible": false }
    }
    games[new_game_code] = { started_on: Date.now(), words: words, players: {}, chat: [] }
    res.json({ game_code: new_game_code })
})

module.exports = app