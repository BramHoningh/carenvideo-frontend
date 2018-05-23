<template>
  <div class="home">
    <a v-show="!token" :href="authLink">Authenitcate With Caren</a>
  </div>
</template>

<script>
import variables from '@/variables'
// @ is an alias to /src

export default {
  name: 'home',
  data () {
    return {
      authLink: "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" + variables.clientId + "&redirect_uri=" + variables.redirectUri + "&scope=user.read+calendar.read+care_givers.read"
    }
  },
  computed: {
    token () {
      return this.$store.state.token
    }
  }
}
</script>
