<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <nuxt-link to="/codenames" class="link"> codenames </nuxt-link>
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
  methods: {},
};
</script>
