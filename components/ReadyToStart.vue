<template>
  <div>
    <button :class="{ ready: this.ready }" @click="set_ready">
      {{ text }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    game_data: Object,
    personal_data: Object,
    socket: Object,
  },
  data() {
    return {
      ready: false,
      text: "Prêt?",
    };
  },
  methods: {
    set_ready() {
      if (!this.ready) {
        this.ready = true;
        this.text = "Je suis prêt!";
        this.socket.emit("change_data", {
          game_code: this.game_data.game_code,
          path:
            ".teams." +
            this.personal_data.team +
            ".players." +
            this.personal_data.player_index,
          key: "ready",
          new_value: true,
        });
      }
    },
  },
};
</script>

<style>
.ready {
  background-color: green;
}
</style>