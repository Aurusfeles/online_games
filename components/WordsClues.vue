<template>
  <div class="clue_section">
    <div
      v-for="(clues_list, clues_list_index) in game_data.teams[
        game_data.current_team
      ].clues"
      :key="clues_list_index"
      class="clue_column"
    >
      <div class="clue_title">{{ word(clues_list_index) }}</div>
      <div class="clue_text" v-for="(text, index) in clues_list" :key="index">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game_data: Object,
    socket: Object,
    personal_data: Object,
  },
  methods: {
    word(index) {
      if (
        this.game_data.state == "first_clues_making" ||
        this.game_data.current_team == this.personal_data.team
      ) {
        return this.personal_data.word_list[index];
      } else {
        return "Mot mystère " + (index + 1);
      }
    },
  },
};
</script>

<style>
.clue_section {
  display: flex;
  width: 100%;
  height: 100%;
}

.clue_column {
  border: 1px solid #ffffff;
  width: 25%;
  flex-grow: 1;
}

.clue_title {
  font-size: 3vh;
  text-transform: uppercase;
  background: rgba(240, 248, 255, 0.205);
  text-align: center;
}

.clue_text {
  font-size: 3vh;
  padding-left: 1vh;
}
</style>