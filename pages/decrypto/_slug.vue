<template>
  <div class="game_page">
    <Teams
      :socket="socket"
      :game_data="game_data"
      :personal_data="personal_data"
    />
    <Join
      v-if="personal_data.player_index == -1"
      :socket="socket"
      :game_code_to_join="game_code_to_join"
    />
    <div v-else class="panel_section">
      <div
        v-for="(panel, panel_index) in panels"
        :key="panel_index"
        :is="panel"
        :socket="socket"
        :game_data="game_data"
        :personal_data="personal_data"
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
      panels: [],
      socket: null,
      game_data: {},
      game_code_to_join: "",
      personal_data: {
        player_index: -1,
        team: "idc",
      },
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

    this.socket.on("game_data", (msg) => (this.game_data = msg));
    this.socket.on("personal_data", (msg) => {
      console.log("personal data", msg);
      this.personal_data = msg;
    });

    this.socket.on("change_data", (msg) => {
      console.log("change", msg);
      let obj = toolbox.resolve_path(this.game_data, msg.path);
      if (obj) {
        this.$set(obj, msg.key, msg.value);
        this.check_state();
      }
    });

    this.socket.on("add_element", (msg) => {
      console.log("add_element", msg);
      let obj = toolbox.resolve_path(this.game_data, msg.path);
      if (obj) {
        obj.push(msg.element);
        this.check_state();
      }
    });

    this.socket.on("delete_element", (msg) => {
      console.log("delete", msg);
      let obj = toolbox.resolve_path(this.game_data, msg.path);
      if (obj) {
        obj.splice(msg.element_index, 1);
        this.check_state();
      }
    });

    this.socket.on("code", (msg) => {
      console.log("code");
      this.$set(this.personal_data, "code", msg);
    });

    if (this.slug) {
      this.game_code_to_join = this.slug;
      this.socket.emit("game_data", { game_code: this.game_code_to_join });
    }
  },
  methods: {
    check_state() {
      switch (this.game_data.state) {
        case "start":
          this.panels = ["Words", "ReadyToStart"];
          break;
        case "first_clues_making":
        case "clues_making":
          if (
            this.game_data.teams[this.personal_data.team].players[
              this.personal_data.player_index
            ].ready
          ) {
            this.panels = ["Words", "WaitingForPlayer", "WordsClues"];
          } else {
            this.panels = ["Words", "EnterClues", "WordsClues"];
          }
          break;
        case "first_clues_guessing":
        case "clues_guessing":
          if (
            this.game_data.teams[this.personal_data.team]
              .current_player_index == this.personal_data.player_index
          ) {
            this.panels = ["Words", "WaitingForGuesses", "WordsClues"];
          } else {
            this.panels = ["Words", "GuessClues", "WordsClues"];
          }
          break;
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