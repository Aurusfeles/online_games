<template>
  <v-row justify="center" align="center">
    <div @click="create" to="/codenames" class="link">codenames</div>
    <div @click="create" to="/decrypto" class="link">decrypto</div>
    <div v-if="error">
      {{ error }}
    </div>
  </v-row>
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
    create() {
      this.$axios
        .$post("/codenames/create_game")
        .then(
          (response) => this.$router.push("/codenames/" + response.game_code)
          // rediriger vers une page avec un slug codenames/W5KG
        )
        .catch((error) => (this.error = error));
      return;
    },
  },
};
</script>
