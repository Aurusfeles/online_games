<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div @click="create" to="/codenames" class="link">codenames</div>
      <div v-if="error">
        {{ error }}
      </div>
    </v-col>
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
