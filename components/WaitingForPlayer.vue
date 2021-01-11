<template>
  <div>
    Veuillez patienter, {{ current_player.name }} prépare ses indices...
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
  computed: {
    current_player() {
      return this.game_data.teams[this.team].players[
        this.game_data.teams[this.team].current_player
      ];
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>