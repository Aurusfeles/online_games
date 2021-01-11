<template>
  <div class="game_page">
    <Teams
      :game_code="game_code"
      :socket="socket"
      :game_data="game_data"
      :player="player"
      :team="team"
    />
    <div class="panel_section">
      <div
        v-for="(panel, panel_index) in panels"
        :key="panel_index"
        :is="panel"
        :game_code="game_code"
        :socket="socket"
        :game_data="game_data"
        :player="player"
        :team="team"
      ></div>
    </div>
  </div>
</template>

<script>
import ReadyToStart from "~/components/ReadyToStart";
import Words from "~/components/Words";
import WordsClues from "~/components/WordsClues";
import EnterClues from "~/components/EnterClues";
import Chat from "~/components/Chat";
import Teams from "~/components/Teams";
import Join from "~/components/Join";
import WaitingForPlayer from "~/components/WaitingForPlayer";
import WaitingForGuesses from "~/components/WaitingForGuesses";
import GuessClues from "~/components/GuessClues";

const toolbox = require("~/assets/js/toolbox.js");

export default {
  data() {
    return {
      panels: ["Join"],
      game_code: "",
      socket: null,
      game_data: {},
      player: { name: "" },
      team: "idc",
    };
  },
  components: {
    Join,
    Teams,
    Chat,
    ReadyToStart,
    EnterClues,
    Words,
    WordsClues,
    GuessClues,
    WaitingForPlayer,
    WaitingForGuesses,
  },
  computed: {},
  async asyncData({ params }) {
    const slug = params.slug; // When calling /abc the slug will be "abc"
    return { slug };
  },
  mounted() {
    this.socket = io();
    this.socket.on("teams", (msg) => {
      this.$set(this.game_data, "teams", msg);
    });
    this.socket.on("game_data", (msg) => {
      console.log("game_data");
      this.team = msg.team;
      this.player = msg.player;
      this.game_code = msg.game_code;
      this.game_data = msg.game_data;
      this.panels = ["Words", "ReadyToStart"];
    });

    this.socket.on("change_data", (msg) => {
      let obj = toolbox.resolve_path(game_data, msg.path);
      if (obj) {
        this.$set(obj, msg.key, msg.new_value);
      }
    });

    this.socket.on("add_element", (msg) => {
      let obj = toolbox.resolve_path(game_data, msg.path);
      if (obj) {
        obj.push(msg.new_element);
      }
    });

    this.socket.on("delete_element", (msg) => {
      let obj = toolbox.resolve_path(game_data, msg.path);
      if (obj) {
        obj.splice(msg.element_index, 1);
      }
    });

    this.socket.on("new_player", (msg) => {
      console.log("nouveau");
      this.game_data.teams[msg.team].players.push(msg.player);
    });
    this.socket.on("waiting_for_player", (msg) => {
      this.game_data.teams[this.team].current_player = msg;
      this.panels = ["Words", "WaitingForPlayer"];
    });
    this.socket.on("waiting_for_guesses", (msg) => {
      this.panels = ["Words", "WaitingForGuesses"];
    });
    this.socket.on("msg_global", (msg) => this.global_chat.push(msg));
    this.socket.on("msg_team", (msg) => this.team_chat.push(msg));
    this.socket.on("player_left", (msg) => {
      let players = this.game_data.teams[msg.team].players;
      for (let player_index in players) {
        if (players[player_index].name == msg.player.name) {
          console.log(msg.player.name, " est parti:", msg.reason);
          players.splice(player_index, 1);
        }
      }
    });
    this.socket.on("clue_set", (msg) => {
      this.add_clue(msg.team, msg.clue);
    });
    this.socket.on("clues_to_guess", (msg) => {
      this.game_data.current_team = msg.team;
      this.game_data.teams[msg.team].current_clues = msg.clues;
      this.panels = ["GuessClues", "WordsClues"];
    });
    this.socket.on("code", (msg) => {
      console.log("code");
      this.player.code = msg;
      this.game_data.current_team = this.team;
      this.panels = ["Words", "EnterClues", "WordsClues"];
    });

    if (this.slug) {
      this.game_code = this.slug;
      this.socket.emit("get_teams", { game_code: this.game_code });
    }
  },
  methods: {
    add_clue(team, clue) {
      for (let index in clue.code) {
        console.log(this.clues[team], clue.code[index]);
        this.clues[team][clue.code[index]].push(clue.texts[index]);
      }
    },
  },
};
</script>

<style>
.game_page {
  position: relative;
  flex-wrap: wrap;
  height: 100vh;
  width: 100vw;
}

.panel_section {
  position: absolute;
  top: 15vh;
  left: 0vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 85vw;
  height: 100vh;
  justify-content: space-evenly;
}

.player_form {
  font-size: 5vh;
  width: 100vw;
  height: 100vh;
}

.player_form input {
  color: aliceblue;
}

.button {
  background-color: limegreen;
  color: white;
}
</style>