<template>
  <div>
    <button @click="create">Create</button>
    <div v-if="game_code == ''">
      <input v-model="game_code_to_join" placeholder="gamecode to join" />
      <button @click="join">Join</button>
    </div>
    <div v-else>
      {{ game_code }}
    </div>
    <input v-model="msg_to_send" placeholder="message..." />
    <button @click="send_msg">Send</button>
  </div>
</template>

<script>
export default {
  head: {
    script: [
      {
        src:
          "https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.4/socket.io.js",
      },
    ],
  },
  data() {
    return {
      game_code_to_join: "",
      msg_to_send: "",
      game_messages: "",
      game_code: "",
      socket: null,
      game_data: {},
    };
  },
  computed: {},
  async asyncData({ params }) {
    const slug = params.slug; // When calling /abc the slug will be "abc"
    return { slug };
  },
  mounted() {
    this.socket = io();
    this.socket.on("game_data", (game_data) => (this.game_data = game_data));
    if (this.slug) {
      this.game_code_to_join = this.slug;
    }
  },
  methods: {
    create() {
      this.$axios
        .$post("/codenames/create_game")
        .then(
          (response) => (this.game_code = response.game_code)
          // rediriger vers une page avec un slug codenames/W5KG
        )
        .catch((error) => (this.error = error));
      return;
    },
    join() {
      this.socket.emit("join_game", { game_code: this.game_code_to_join });
    },
    send_msg() {
      return;
    },
  },
};
</script>

<style>
</style>