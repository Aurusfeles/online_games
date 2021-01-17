<template>
  <div>
    <div>
      Votre code est
      <span v-for="number in personal_data.code" :key="number"
        >{{ number + 1 }}
      </span>
    </div>
    <div v-for="(number, index) in personal_data.code" :key="index">
      Pour le mot n°{{ number + 1 }} ({{
        personal_data.word_list[number].toUpperCase()
      }}) :<input v-model="texts[index]" />
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
    game_data: Object,
    socket: Object,
    personal_data: Object,
  },
  methods: {
    send_clues() {
      this.socket.emit("change_data", {
        game_code: this.game_data.code,
        path: ".teams." + this.personal_data.team,
        key: "current_clues",
        value: this.texts,
      });
      this.socket.emit("change_data", {
        game_code: this.game_data.code,
        path: ".teams." + this.personal_data.team,
        key: "current_code",
        value: this.personal_data.code,
        destination: "secret",
      });
      this.socket.emit("change_data", {
        game_code: this.game_data.code,
        path:
          ".teams." +
          this.personal_data.team +
          ".players." +
          this.personal_data.player_index,
        key: "ready",
        value: true,
      });
    },
  },
};
</script>

<style scoped>
.ready {
  background-color: green;
}
</style>