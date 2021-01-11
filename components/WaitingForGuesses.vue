<template>
  <div>Veuillez patienter, les autres joueurs décryptent vos indices...</div>
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
};
</script>

<style scoped>
</style>