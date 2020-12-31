<template>
  <div class="game_list">
    <div @click="create('codenames')" to="/codenames" class="game">
      codenames
    </div>
    <div @click="create('decrypto')" to="/decrypto" class="game">decrypto</div>
    <div v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      error: "",
    };
  },
  components: {},
  methods: {
    create(game) {
      this.$axios
        .$post("/" + game + "/create_game")
        .then(
          (response) => this.$router.push("/" + game + "/" + response.game_code)
          // rediriger vers une page avec un slug codenames/W5KG
        )
        .catch((error) => (this.error = error));
      return;
    },
  },
};
</script>

<style scoped>
.game_list {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

.game {
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  width: 30vw;
  font-size: 5vh;
  text-transform: uppercase;
  background-color: rgb(71, 2, 150);
  border-radius: 1vh;
  padding: 1vh;
}
</style>
