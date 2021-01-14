<template>
  <div>
    <div v-for="(text, text_index) in clues" :key="text_index">
      Pour l'indice {{ text }}:
      <select @change="send_guess" v-model.number="reply[text_index]">
        <option value="-1">Choisissez</option>
        <option
          v-for="(word, word_index) in word_list"
          :key="word_index"
          :value="word_index"
        >
          {{ word }}
        </option>
      </select>
    </div>
    <button @click="click" :class="{ ready: this.ready }">Je suis sûr!</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      reply: [-1, -1, -1],
      ready: false,
    };
  },
  props: {
    game_data: Object,
    socket: Object,
    personal_data: Object,
  },
  computed: {
    word_list() {
      if (this.game_data.current_team == this.team) {
        return this.personal_data.word_list;
      } else {
        return [
          "Mot mystère 1",
          "Mot mystère 2",
          "Mot mystère 3",
          "Mot mystère 4",
        ];
      }
    },
    clues() {
      return this.game_data.teams[this.game_data.current_team].current_clues;
    },
  },
  methods: {
    click() {
      this.ready = true;
      this.send_guess();
    },
    send_guess() {
      this.socket.emit("change_data", {
        game_code: this.game_data.game_code,
        path:
          ".teams." +
          this.personal_data.team +
          ".players." +
          this.personal_data.player_index,
        key: "code",
        value: this.reply,
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