<template>
  <div>
    <div v-if="game_code == ''">
      <input v-model="game_code_to_join" placeholder="gamecode to join" />
      <button @click="join">Join</button>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      game_code_to_join: "",
      msg_to_send: "",
      game_messages: "",
      game_code: "",
      socket: null,
      game_data: {},
      player: { name: "aurus" },
      global_chat: [],
    };
  },
  computed: {},
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
        player: { name: this.name, role: this.role },
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
</style>