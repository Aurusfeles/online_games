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
      if (this.clues_team == this.personal_data.team) {
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
      return this.game_data.teams[this.clues_team].current_clues;
    },
    clues_team() {
      if (this.game_data.state == "first_clues_guessing") {
        return this.personal_data.team;
      } else {
        return this.game_data.current_team;
      }
    },
  },
  methods: {
    click() {
      this.send_guess();
      this.ready = true;
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
    send_guess() {
      this.socket.emit("change_data", {
        game_code: this.game_data.code,
        path:
          ".teams." +
          this.personal_data.team +
          ".players." +
          this.personal_data.player_index,
        key: "current_guess",
        value: this.reply,
        secret: true,
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