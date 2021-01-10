<template>
  <div>
    <div v-for="(text, text_index) in clue_texts" :key="text_index">
      Pour l'indice {{ text }}:
      <select v-model.number="reply[text_index]">
        <option value="-1">Choisissez</option>
        <option
          v-for="(word, word_index) in word_list"
          :key="word_index"
          :value="word_index"
        >
          {{ team == clue_team ? word : "Mot mystère" + word_index + 1 }}
        </option>
      </select>
    </div>
    <button @click="send_clues">Send clues</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      reply: [-1, -1, -1],
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
    clue_texts: {
      type: Array,
    },
    clue_team: {
      type: String,
    },
  },
  methods: {
    send_clues() {
      this.socket.emit("clue_guess", {
        game_code: this.game_code,
        player: this.player,
        team: this.team,
        clue: {
          code: this.reply,
          texts: this.texts,
        },
      });
    },
  },
};
</script>

<style scoped>
</style>