const bodyParser = require('body-parser')
const app = require('express')()


var fs = require('fs');
var words_file = require('./fr_words.json');
var firebase_admin = require('firebase-admin');


var firebase_credentials = require('./firebase_credentials.json');

if (firebase_admin.apps.length == 0) {
    firebase_admin.initializeApp({
        credential: firebase_admin.credential.cert(firebase_credentials),
        databaseURL: "https://aurus-games-default-rtdb.firebaseio.com",
        authDomain: "aurus-games.firebaseapp.com",
    });
}

var firebase_db = firebase_admin.database();


app.use(bodyParser.json());

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
    let ref = firebase_db.ref("/games")
    let new_game_code = generate_game_code()
    let word_list = generate_word_list()
    let word_colors = generate_word_colors("blue")
    let words = {}

    for (let i = 0; i < 25; i++) {
        words[word_list[i]] = { "color": word_colors[i], "visible": false }
    }
    // A FAIRE: vérifier que le code n'éxiste pas déjà
    ref.child(new_game_code).set(
        { type: "codenames", started_on: Date.now(), words: words, players: {} }
    )
    res.json({ game_code: new_game_code })


})

module.exports = app