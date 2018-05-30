<template>
<div>
  <h1>TO ROOM</h1>
</div>
</template>

<script>  
import variables from '@/variables'

export default {
  name: 'toRoom',
  created () {
    console.log(this.$route.params.id)

    if (!this.$store.getters.getToken) {
      window.location = "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" + variables.clientId + "&redirect_uri=" + variables.redirectUri + "&scope=user.read+calendar.read+care_givers.read"
    }


  }
}
</script>

<style lang="scss" scoped>

</style>
