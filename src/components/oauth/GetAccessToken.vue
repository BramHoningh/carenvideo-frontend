<template>
  
</template>

<script>
export default {
  name: 'getAccessToken',

  /**
   * Checks if a access_token is set in the url, retrieves it and adds it to the store
   */
  created () {
    if (this.$route.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/)) {
      let token = this.$route.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1]
      this.$store.dispatch('addToken', {
        token: token
      })
      .then(_ => {
        this.$router.push('/')
      })
    } else {
      // TODO: Show error?
      this.$router.push('/')
    }
  }
}
</script>

