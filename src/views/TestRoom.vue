<template>
<div>
  <h1>FAKE ID 12345 HAS BEEN ADDED TO THE PRESENCE CHANNEL</h1>
</div>
</template>

<script>
import Pusher from "pusher-js";

export default {
  name: 'testRoom',
  data () {
    return {
      fakeId: 12345
    }
  },
  created () {
    let presencePusher = new Pusher("8dc95d49e9a8f15e0980", {
      cluster: "eu",
      encrypted: true,
      authEndpoint: "http://localhost:5000/pusher/auth/presence",
      auth: {
        params: { id: this.fakeId }
      }
    });

    let privatePusher = new Pusher("8dc95d49e9a8f15e0980", {
      cluster: "eu",
      encrypted: true,
      authEndpoint: "http://localhost:5000/pusher/auth/private"
    })

    let presenceChannel = presencePusher.subscribe('presence-all')

    presenceChannel.bind('client-event-id-12345', data => {
      console.log(data)
    })
  }
}
</script>

<style lang="scss" scoped>

</style>

