<template>
  <div class="home">
    <a v-show="!token" href="https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=6a38d19e07d34c5ee51f349475b8c580897af536b875c591bfeb83752e12c98e&redirect_uri=http://localhost:8080/oauth&scope=user.read+calendar.read+care_givers.read">Authenitcate With Caren</a>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'home',
  components: {
  },
  methods: {
    carenLogin () {

    }
  },
  computed: {
    token () {
      return this.$store.state.token
    }
  },
  created () {
    
  }
}
</script>
