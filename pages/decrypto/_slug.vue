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

export default {
  data() {
    return {
      panels: ["Join"],
      game_code_to_join: "",
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
      this.team = msg.team;
      this.game_code = msg.game_code;
      this.game_data = msg.game_data;
      this.global_chat = msg.game_data.chat;
      this.word_list = msg.game_data.teams[this.team].words;
      this.team_chat = msg.game_data.teams[this.team].chat;
      for (const team in msg.game_data.teams) {
        for (const clue in msg.game_data.teams[team].clues) {
          this.add_clue(team, clue);
        }
      }
    });
    this.socket.on("new_player", (msg) => {
      console.log("nouveau");
      this.game_data.teams[msg.team].players.push(msg.player);
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
      this.clues_to_guess = msg;
      this.action = "clues_to_guess";
    });
    this.socket.on("code", (msg) => {
      console.log(msg);
      this.code = msg;
      this.action = "enter_clues";
    });

    if (this.slug) {
      this.game_code_to_join = this.slug;
      console.log("ok");
      console.log(this.socket);
      this.socket.emit("get_teams", { game_code: this.game_code_to_join });
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
  align-items: center;
  width: 85vw;
  height: 45vh;
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