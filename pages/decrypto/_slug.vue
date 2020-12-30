<template>
  <div>
    <div v-if="game_code == ''">
      <div class="player_form">
        <v-text-field
          v-model="player.name"
          placeholder="Your name?"
          label="name"
          outlined
        ></v-text-field>
        <input />
        <input type="radio" id="white" value="white" v-model="team" />
        <label for="guess">White team!</label>
        <br />
        <input type="radio" id="black" value="black" v-model="team" />
        <label for="black">Black team!</label>
        <br />
        <input type="radio" id="idc" value="idc" v-model="team" />
        <label for="black">I don't care!</label>
        <br />
        <input v-model="game_code_to_join" placeholder="gamecode to join" />
        <button @click="join" :disabled="!ok_to_join">Join</button>
      </div>
    </div>
    <div v-else>
      {{ game_code }}
    </div>

    <div
      class="chat_box"
      style="height: 100px; overflow: hidden; position: relative"
    >
      <div class="floating_div" style="position: absolute; bottom: 0">
        <span v-for="(message, message_key) in global_chat" :key="message_key">
          <span class="message_player_name">{{ message.player.name }}</span
          >:<span class="message">{{ message.text }}</span
          ><br />
        </span>
      </div>
    </div>
    <input v-model="msg_to_send" placeholder="message..." />
    <button @click="send_msg">Send</button>
    <div class="word_list">
      <div
        class="word"
        v-for="(word, word_index) in word_list"
        :key="word_index"
      >
        {{ word }}
      </div>
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
      this.game_code = msg.game_code;
      this.game_data = msg.game_data;
      this.global_chat = msg.game_data.chat;
      this.word_list = msg.game_data.teams[this.team].words;
      this.team_chat = msg.game_data.teams[this.team].chat;
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
.word_list {
  display: flex;
  width: 75vw;
  height: 25vh;
}
.word {
  width: 15vw;
  height: 10vh;
  background-color: blue;
}
</style>