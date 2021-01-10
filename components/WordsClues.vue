<template>
  <div class="clue_section">
    <div
      v-for="(clues_list, clues_list_name) in game_data.teams[
        game_data.current_team
      ].clues"
      :key="clues_list_name"
      class="clue_column"
    >
      <div class="clue_title">mot mystère {{ clues_list_name }}</div>
      <div class="clue_text" v-for="(text, index) in clues_list" :key="index">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game_code: String,
    game_data: Object,
    socket: Object,
    player: Object,
    team: String,
  },
};
</script>

<style>
.clue_section {
  display: flex;
}

.clue_column {
  border: 1px solid #ffffff;
  flex-grow: 1;
}

.clue_title {
  font-size: 3vh;
  text-transform: uppercase;
  background: rgba(240, 248, 255, 0.205);
}

.clue_text {
  font-size: 3vh;
  padding-left: 1vh;
}
</style>