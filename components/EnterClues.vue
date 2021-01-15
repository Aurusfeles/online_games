<template>
  <div>
    <div>
      Votre code est
      <span v-for="number in personal_data.code" :key="number"
        >{{ number + 1 }}
      </span>
    </div>
    <div v-for="number in personal_data.code" :key="number">
      Pour le mot n°{{ number + 1 }} ({{
        personal_data.word_list[number].toUpperCase()
      }}) :<input v-model="texts[number]" />
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
      this.socket.emit("clue_set", {
        game_code: this.game_data.code,
        player_index: this.personal_data.player_index,
        team: this.personal_data.team,
        clue: {
          code: this.personal_data.code,
          texts: this.texts,
        },
      });
    },
  },
};
</script>

<style scoped>
</style>