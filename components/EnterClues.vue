<template>
  <div>
    <div>
      Votre code est
      <span v-for="number in player.code" :key="number">{{ number + 1 }} </span>
    </div>
    <div v-for="number in player.code" :key="number">
      Pour le mot {{ game_data.teams[team].words[number] }}:<input
        v-model="texts[number]"
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
    game_code: String,
    game_data: Object,
    socket: Object,
    player: Object,
    team: String,
  },
  methods: {
    send_clues() {
      this.socket.emit("clue_set", {
        game_code: this.game_code,
        player: this.player,
        team: this.team,
        clue: {
          code: this.player.code,
          texts: this.texts,
        },
      });
    },
  },
};
</script>

<style scoped>
</style>