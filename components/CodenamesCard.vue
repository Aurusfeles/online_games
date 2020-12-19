<template>
  <v-btn
    :color="color"
    class="ma-1"
    :light="light"
    :outlined="!word_info.flipped"
    x-large
  >
    <v-icon v-if="this.word_info.color == 'black'" left>mdi-skull</v-icon
    >{{ word
    }}<v-icon right v-if="this.word_info.color == 'black'">mdi-skull</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: {
    word: { type: String },
    word_info: { type: Object },
  },
  computed: {
    light() {
      return (
        this.word_info.color == "white" || this.word_info.color == "unknown"
      );
    },
    color() {
      switch (this.word_info.color) {
        case "red":
        case "blue":
        case "white":
          return this.word_info.color;
        case "black":
          return this.word_info.flipped ? "grey darken-3" : "grey";
        default:
          return "orange lighten-5";
      }
    },
  },
};
</script>

<style>
</style>