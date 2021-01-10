<template>
  <div>
    <div v-for="number in code" :key="number">
      Pour le mot {{ word_list[number - 1] }}:<input
        v-model="texts[number - 1]"
      />
    </div>
    <button @click="send_clues">Send clues</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      texts: ["", "", ""],
    };
  },
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
    send_clues() {
      this.socket.emit("clue_set", {
        game_code: this.game_code,
        player: this.player,
        team: this.team,
        clue: {
          code: this.code,
          texts: this.texts,
        },
      });
    },
  },
};
</script>

<style scoped>
</style>