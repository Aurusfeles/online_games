<template>
  <div>
    {{ message }}
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
    current_player_list() {
      let current_players = [];
      for (const team in this.game_data.teams) {
        for (const player of this.game_data.teams[team].players) {
          if (!player.ready) {
            current_players.push(player.name);
          }
        }
      }
      return current_players;
    },
    message() {
      if (this.current_player_list.length > 1) {
        return (
          "Veuillez patienter, " +
          this.current_player_list.join(",") +
          " préparent leurs indices..."
        );
      } else {
        return (
          "Veuillez patienter, " +
          this.current_player_list.join(",") +
          " prépare ses indices..."
        );
      }
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>