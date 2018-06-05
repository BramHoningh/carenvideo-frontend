<template>
<div class="room">
  <div class="video-container">
    <video class="streamVideo" ref="streamVideo" autoplay></video>
    <video class="ownVideo" ref="ownVideo" autoplay muted></video>
  </div>
</div>
</template>

<script>
import Pusher from "pusher-js";
import SimplePeer from "simple-peer";
import axios from 'axios';

import variables from '../variables'

export default {
  name: 'room',
  data() {
    return {
      isInitiator: false,
      hasAnswer: false,
      pusher: null,
      p: null,
      count: 0,
      stream: null,
      id: null
    };
  },
  computed: {
    privateChannel () {
      return this.$store.getters.getPrivateChannel
    }
  },
  methods: {
    initializePusher (stream) {
      Pusher.logToConsole = true;
      console.log(this.$store.getters.getCurrentUser.person_id)
      console.log(this.id)

      if (!this.$store.getters.getPresencePusherInstance) {
        let presencePusher = new Pusher('8dc95d49e9a8f15e0980', {
          cluster: 'eu',
          encrypted: true,
          authEndpoint: variables.pusherPresence,
          auth: {
            params: {
              id: this.$store.getters.getCurrentUser.person_id || this.id
            }
          }
        })

        this.$store.dispatch('initPresencePusher', {
          pusher: presencePusher
        })
      }

      let privateChannel = this.$store.getters.getPresencePusherInstance.subscribe(`presence-${this.$route.params.roomId}`)

      this.$store.dispatch('initPrivateChannel', {
        channel: privateChannel
      })

      let self = this

      privateChannel.bind("pusher:subscription_succeeded", function() {
        console.log('Successfully subscribed', privateChannel.members.count)

        let isInitiator = (privateChannel.members.count === 2) ? true : false
        self.startStream(stream, isInitiator, privateChannel)        
      });

      privateChannel.bind('pusher:subscription_error', function(status) {
        console.log(status)
      });

    },

    startStream(stream, isInitiator, channel) {
      console.log('other stream: isInitiator', isInitiator)
      console.log('with channel:', channel)

      let video = this.$refs.ownVideo;
      video.srcObject = stream;
      video.play();

      let gotData = false

      let peer = new SimplePeer({
        initiator: isInitiator,
        stream: stream
      })

      peer.on('signal', (data) => {
        if (isInitiator || gotData) {
          channel.trigger('client-peer-data-event', {
            msg: JSON.stringify(data)
          })
        }
      })

      channel.bind('client-peer-data-event', (data) => {
        gotData = true
        peer.signal(data.msg)
      })

      peer.on('stream', (stream) => {
        let video = this.$refs.streamVideo;
        video.srcObject = stream;
        video.play();
      })

      peer.on('error', (error) => {
        console.error(error)
      })
    }
  },
  mounted() {
    // get video/voice stream
    navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

    let self = this

    navigator.getUserMedia(
      { video: true, audio: true },
      this.initializePusher,
      function(err) {
        console.log("MEDIA ERROR", err);
      }
    );
  },
  created () {
    if (this.$store.getters.getToken && !this.$store.getters.getCurrentUser.person_id) {
      console.log('GET USER')
      axios.get('https://www.carenzorgt.nl/api/v1/user', {
        headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken }
      })
      .then(response => {
        console.log(response.data.person_id)

        this.id = response.data.person_id

        this.$store.dispatch('addCurrentUser', {
          currentUser: response.data
        })

        this.$store.getters.getCurrentUser
      })
      .catch(error => {
        console.error(error)
      })
    } else {
      console.log('NO TOKEN SET')
    }
    
  }
}
</script>

<style lang="scss" scoped>
.room {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  padding: 20px;

  .video-container {
    position: relative;

    video.streamVideo {
      width: 100%;
      background-color: pink;
    }

    video.ownVideo {
      position: absolute;
      bottom: 15px;
      right: 10px;
      width: 200px;
      box-shadow: 1px 1px 10px #000;
    }
  }
}
</style>

