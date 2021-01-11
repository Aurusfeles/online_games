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
    <button @click="ready = true" :class="{ ready: this.ready }">
      Je suis sûr!
    </button>
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
    game_code: String,
    game_data: Object,
    socket: Object,
    player: Object,
    team: String,
  },
  computed: {
    word_list() {
      if (this.game_data.current_team == this.team) {
        return this.game_data.teams[this.team].words;
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
    send_guess() {
      this.socket.emit("clue_guess", {
        game_code: this.game_code,
        player: this.player,
        team: this.team,
        code: this.reply,
        ready: this.ready,
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