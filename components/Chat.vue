<template>
  <div v-if="false" class="chat_section">
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
    <button :disabled="msg_to_send == ''" @click="send_msg">Send</button>
  </div>
</template>

<script>
export default {
  data() {
    msg_to_send: "";
  },
  props: {
    game_code: String,
    game_data: Object,
    socket: Object,
    player: Object,
    team: String,
  },
  methods: {
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
.chat_section {
  position: absolute;
  top: 40vh;
  left: 0px;
  width: 85vw;
  height: 60vh;
}
</style>