<template>
  <div>
    Cliquez lorsque vous êtes prêt

    <button @click="send_ready" class="button" type="button">prêt!</button>
  </div>
</template>

<script>
export default {
  props: {
    game_code: {
      type: String,
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