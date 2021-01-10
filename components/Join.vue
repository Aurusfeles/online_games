<template>
  <div>
    <div class="player_form">
      <div class="name">
        <label for="name">Your name: </label>
        <input
          v-model="player.name"
          placeholder="enter your name here"
          label="name"
          id="name"
          outlined
        />
      </div>

      <div>
        <input type="radio" id="white" value="white" v-model="team" />
        <label for="guess">White team!</label>
        <br />
        <input type="radio" id="black" value="black" v-model="team" />
        <label for="black">Black team!</label>
        <br />
        <input type="radio" id="idc" value="idc" v-model="team" />
        <label for="black">I don't care!</label>
      </div>
      <label for="game_code_to_join">Game code to join</label>
      <input
        v-model="game_code"
        id="game_code"
        placeholder="enter game code here"
      />
      <button @click="join" :disabled="!ok_to_join">Join</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game_code: String,
    teams: Object,
    socket: Object,
  },
  data() {
    return {
      player: { name: "" },
      team: "idc",
    };
  },
  computed: {
    ok_to_join() {
      return this.player.name != "" && this.team != "" && this.game_code != "";
    },
  },
  methods: {
    join() {
      this.socket.emit("join_game", {
        game_code: this.game_code,
        team: this.team,
        player: this.player,
      });
    },
  },
};
</script>

<style>
.player_form {
  position: absolute;
  left: 0vw;
  top: 0vh;
  font-size: 5vh;
  width: 85vw;
  height: 100vh;
}

.player_form input {
  color: aliceblue;
}
</style>
