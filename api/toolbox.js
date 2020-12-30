var words_file = require('./fr_words.json');

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

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function shuffle(array_to_shuffle) {
    // returns array_to_shuffle with random order
    var ctr = array_to_shuffle.length, temp, index;

    // While there are elements in the array
    while (ctr > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
        ctr--;
        // And swap the last element with it
        temp = array_to_shuffle[ctr];
        array_to_shuffle[ctr] = array_to_shuffle[index];
        array_to_shuffle[index] = temp;
    }
    return array_to_shuffle;
}

export function generate_game_code(length = 5) {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += code_chars[Math.floor(Math.random() * code_chars.length)]
    }
    return code;
}

export function generate_word_list(length) {
    return shuffle(words_file).slice(0, length)
}