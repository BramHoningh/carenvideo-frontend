<template>
  <div class="home">
    
  </div>
</template>

<script>
import axios from 'axios'
import variables from '@/variables'

export default {
  name: 'home',
  data () {
    return {
      authLink: "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" + variables.clientId + "&redirect_uri=" + variables.redirectUri + "&scope=user.read+calendar.read+care_givers.read",
      apiEndpoint: 'https://www.carenzorgt.nl/api/v1/user',
    }
  },
  computed: {
    token () {
      return this.$store.state.token
    }
  },
  methods: {

  },
  created () {
    if (this.token) {
      this.$store.dispatch('getUsers')
    }
  }
}
</script>
