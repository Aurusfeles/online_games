<template>
  <div>
    Nous attendons après les joueurs suivants:
    <div v-for="(player, player_index) in waiting_list" :key="player_index">
      {{ player.name }} de l'équipe {{ player.team }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    teams: {
      type: Object,
    },
  },
  computed: {
    waiting_list() {
      let waiting_list = [];
      for (const team in teams) {
        for (const player of teams[team]) {
          if (player.playing) {
            waiting_list.push({ name: player.name, team: team });
          }
        }
      }
      return waiting_list;
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>