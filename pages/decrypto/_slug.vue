<template>
  <div>
    <div v-if="game_code == ''">
      <div class="player_form">
        <div class="name">
          <label for="name">Your name: </label>
          <input
            v-model="player.name"
            placeholder="enter your name here"
            label="name"
            id="name"
            outlined
          />
        </div>

        <div class="team">
          <input type="radio" id="white" value="white" v-model="team" />
          <label for="guess">White team!</label>
          <br />
          <input type="radio" id="black" value="black" v-model="team" />
          <label for="black">Black team!</label>
          <br />
          <input type="radio" id="idc" value="idc" v-model="team" />
          <label for="black">I don't care!</label>
        </div>
        <label for="game_code_to_join">Game code to join</label>
        <input
          v-model="game_code_to_join"
          id="game_code_to_join"
          placeholder="enter game code here"
        />
        <button @click="join" :disabled="!ok_to_join">Join</button>
      </div>
    </div>
    <div v-else class="game_page">
      <div class="word_number_section">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </div>
      <div class="word_section">
        <div
          class="word"
          v-for="(word, word_index) in word_list"
          :key="word_index"
        >
          {{ word }}
        </div>
      </div>
      <div class="team_section">
        <div
          class="team"
          v-for="(team, team_name, team_index) in game_data.teams"
          :key="team_index"
        >
          <div class="team_name">{{ team_name }}</div>
          <div
            class="player"
            v-for="(player_obj, player_index) in team.players"
            :key="player_index"
          >
            <div
              class="player_name"
              :class="{ you: player_obj.name == player.name }"
            >
              {{ player_obj.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="chat_section">
        <div
          class="chat_box"
          style="height: 100px; overflow: hidden; position: relative"
        >
          <div class="floating_div" style="position: absolute; bottom: 0">
            <span
              v-for="(message, message_key) in global_chat"
              :key="message_key"
            >
              <span class="message_player_name">{{ message.player.name }}</span
              >:<span class="message">{{ message.text }}</span
              ><br />
            </span>
          </div>
        </div>
        <input v-model="msg_to_send" placeholder="message..." />
        <button @click="send_msg">Send</button>
      </div>
      <div class="clue_section">blabla</div>
    </div>
  </div>
</template>

<script>
import CodenamesCard from "~/components/CodenamesCard";
export default {
  data() {
    return {
      game_code_to_join: "",
      msg_to_send: "",
      game_messages: "",
      game_code: "",
      socket: null,
      game_data: {},
      player: { name: "" },
      team: "idc",
      global_chat: [],
      team_chat: [],
      word_list: [],
    };
  },
  components: { CodenamesCard },
  computed: {
    ok_to_join() {
      return (
        this.player.name != "" &&
        this.team != "" &&
        this.game_code_to_join != ""
      );
    },
  },
  async asyncData({ params }) {
    const slug = params.slug; // When calling /abc the slug will be "abc"
    return { slug };
  },
  mounted() {
    this.socket = io();
    this.socket.on("game_data", (msg) => {
      this.team = msg.team;
      this.game_code = msg.game_code;
      this.game_data = msg.game_data;
      this.global_chat = msg.game_data.chat;
      this.word_list = msg.game_data.teams[this.team].words;
      this.team_chat = msg.game_data.teams[this.team].chat;
    });
    this.socket.on("new_player", (msg) => {
      console.log("nouveau");
      this.game_data.teams[msg.team].players.push(msg.player);
    });
    this.socket.on("msg_global", (msg) => this.global_chat.push(msg));
    this.socket.on("msg_team", (msg) => this.team_chat.push(msg));

    if (this.slug) {
      this.game_code_to_join = this.slug;
    }
  },
  methods: {
    join() {
      this.socket.emit("join_game", {
        game_code: this.game_code_to_join,
        team: this.team,
        player: this.player,
      });
    },
    send_msg() {
      this.socket.emit("msg_global", {
        game_code: this.game_code,
        msg: { text: this.msg_to_send, player: this.player },
      });
      this.msg_to_send = "";
    },
  },
};
</script>

<style>
.game_page {
  position: relative;
  flex-wrap: wrap;
}
.word_number_section {
  position: absolute;
  top: 0vh;
  left: 0vw;
  display: flex;
  align-items: flex-end;
  width: 75vw;
  height: 10vh;
  font-size: 3vh;
  justify-content: space-around;
  background-color: rgb(124, 88, 230);
}
.word_section {
  position: absolute;
  top: 10vh;
  left: 0vw;
  display: flex;
  align-items: flex-start;
  width: 75vw;
  height: 15vh;
  justify-content: space-evenly;
  background-color: rgb(124, 88, 252);
}
.word {
  width: 18vw;
  height: 10vh;
  background-color: blue;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  font-size: 3vh;

  text-transform: uppercase;
}

.team_section {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0vh;
  left: 75vw;
  width: 25vw;
  height: 25vh;
  background-color: darkblue;
}

.chat_section {
  position: absolute;
  top: 25vh;
  left: 0px;
  width: 60vw;
  height: 75vh;
  background-color: cornflowerblue;
}
.clue_section {
  position: absolute;
  top: 25vh;
  left: 60vw;
  width: 40vw;
  height: 75vh;
  background-color: rgb(252, 220, 162);
}

.player_form {
  font-size: 5vh;
  width: 100vw;
  height: 100vh;
}
.player_form input {
  color: aliceblue;
}

.team {
  border: 1px solid #ffffff;
  flex-grow: 1;
}

.team .you {
  font-weight: bold;
}

.team_name {
  font-weight: bold;
  background: rgba(240, 248, 255, 0.205);
}
</style>