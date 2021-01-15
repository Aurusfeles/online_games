<template>
  <div class="team_section">
    <div
      class="team"
      v-for="(team, team_name, team_index) in game_data.teams"
      :key="team_index"
    >
      <div class="team_name">{{ team_name }} team</div>
      <div
        class="player"
        v-for="(player_obj, player_index) in team.players"
        :key="player_index"
      >
        <div
          class="player_name"
          :class="{ you: player_index == personal_data.player_index }"
        >
          {{ player_obj.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game_data: Object,
    socket: Object,
    personal_data: Object,
  },
};
</script>

<style>
.team_section {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0vh;
  left: 85vw;
  width: 15vw;
  height: 100vh;
}

.team {
  border: 1px solid #ffffff;
  flex-grow: 1;
}

.team .you {
  font-weight: bold;
  color: rgb(109, 238, 255);
}

.team_name {
  font-weight: bold;
  padding-left: 1vh;
  font-size: 2.5vh;
  background: rgba(240, 248, 255, 0.205);
}

.player_name {
  padding-left: 1vh;
  font-size: 2.2vh;
}
</style>