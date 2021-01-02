<template>
  <div>
    {{ code }}
  </div>
</template>
<script>
export default {
  props: {
    game_code: {
      type: String,
    },
    word_list: {
      type: Array,
    },
    team: {
      type: String,
    },
    player: {
      type: Object,
    },
    socket: {
      type: Object,
    },
    code: {
      type: Array,
    },
  },
  methods: {
    send_ready() {
      this.socket.emit("ready", {
        game_code: this.game_code,
        team: this.team,
        player: this.player,
      });
    },
  },
};
</script>

<style scoped>
</style>