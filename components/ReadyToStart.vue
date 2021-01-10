<template>
  <div>
    <button :class="{ ready: this.ready }" @click="ready">Ready?</button>
  </div>
</template>

<script>
export default {
  props: {
    game_code: String,
    socket: Object,
    player: Object,
    team: String,
  },
  data() {
    return {
      ready: false,
    };
  },
  methods: {
    ready() {
      this.ready = true;
      this.socket.emit("ready_to_start", {
        game_code: this.game_code,
        team: this.team,
        player: this.player,
      });
    },
  },
};
</script>

<style>
.ready {
  background-color: green;
}
</style>