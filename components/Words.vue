<template>
  <div class="word_section">
    <div class="word" v-for="(word, word_index) in word_list" :key="word_index">
      <div class="word_number">{{ word_index + 1 }}</div>
      {{ word }}
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
  computed: {
    word_list() {
      return this.personal_data.word_list;
    },
  },
};
</script>

<style>
.word_section {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.word {
  width: 20vw;
  height: 10vh;
  background-color: blue;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  font-size: 3.5vh;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 2vh;
  position: relative;
}

.word_number {
  position: absolute;
  left: 9vw;
  top: -3vh;
  font-size: 5vh;
}
</style>