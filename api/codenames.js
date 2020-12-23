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

function clean_words(game) {
    let clean_game = JSON.parse(JSON.stringify(game));
    for (word in clean_game.words) {
        clean_game.words[word].color = "unknown";
    }
    return clean_game;
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
                    if (msg.player.role == "guess") {
                        game = clean_words(game);
                    }
                    socket.emit('game_data', { game_code: msg.game_code, game_data: game });
                }
            });
            socket.on('msg_global', msg => {
                let game = games[msg.game_code];
                if (game) {
                    game.chat.push(msg.msg);
                    io.to(msg.game_code).emit('msg_global', msg.msg);
                }
            });
            socket.on('return_card', msg => {
                let game = games[msg.game_code];
                if (game) {
                    console.log("ok, on retourne!")
                    if (!game.words[msg.word].flipped) {
                        game.words[msg.word].flipped = true;
                        io.to(msg.game_code).emit('card_reveal', { word: msg.word, word_info: game.words[msg.word] });
                    }
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
        words[word_list[i]] = { "color": word_colors[i], "flipped": false }
    }
    games[new_game_code] = { started_on: Date.now(), words: words, players: {}, chat: [] }
    res.json({ game_code: new_game_code })
})

module.exports = app