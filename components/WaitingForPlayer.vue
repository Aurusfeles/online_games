<template>
  <div>
    Veuillez patienter, {{ current_player.name }} prépare ses indices...
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
    current_player() {
      return this.game_data.teams[this.personal_data.team].players[
        this.game_data.teams[this.personal_data.team].current_player_index
      ];
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>