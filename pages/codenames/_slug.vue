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
        <input type="radio" id="guess" value="guess" v-model="player.role" />
        <label for="guess">I'll guess!</label>
        <br />
        <input type="radio" id="tell" value="tell" v-model="player.role" />
        <label for="tell">I'll tell!</label>
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
      <CodenamesCard
        v-for="(word_info, word, word_index) in word_list"
        :word="word"
        :word_info="word_info"
        :key="word_index"
        :style="{
          'grid-column': (word_index % 5) + 1,
          'grid-row': parseInt(word_index / 5) + 1,
        }"
        @dblclick.native="return_card(word)"
      />
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
      player: { name: "aurus", role: "guess" },
      global_chat: [],
      word_list: {},
    };
  },
  components: { CodenamesCard },
  computed: {
    ok_to_join() {
      return (
        this.player.name != "" &&
        this.player.role != "" &&
        this.game_code_to_join != ""
      );
    },
  },
  layout: "vtify",
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
      this.word_list = msg.game_data.words;
    });
    this.socket.on("card_reveal", (msg) => {
      this.word_list[msg.word] = msg.word_info;
    });

    this.socket.on("msg_global", (msg) => this.global_chat.push(msg));
    if (this.slug) {
      this.game_code_to_join = this.slug;
    }
  },
  methods: {
    join() {
      this.socket.emit("join_game", {
        game_code: this.game_code_to_join,
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
    return_card(word) {
      console.log("hey!");
      this.socket.emit("return_card", {
        game_code: this.game_code,
        word: word,
      });
    },
  },
};
</script>

<style>
.word_list {
  display: grid;
}
</style>