<template>
<div class="room">
  <div class="video-container">
    <video class="streamVideo" ref="streamVideo" autoplay></video>
    <video class="ownVideo" ref="ownVideo" autoplay></video>
  </div>
</div>
</template>

<script>
import Pusher from "pusher-js";
import SimplePeer from "simple-peer";

import variables from '../variables'

export default {
  name: 'room',
  data() {
    return {
      isInitiator: false,
      hasAnswer: false,
      pusher: null,
      p: null,
      privateChannel: null
    };
  },
  methods: {
    initializePusher () {
      let privatePUsher = new Pusher('8dc95d49e9a8f15e0980', {
        cluster: 'eu',
        encrypted: true,
        authEndpoint: variables.pusherPrivate,
      })

      this.$store.dispatch('initPrivatePusher', {
        pusher: privatePusher
      })

      console.log(this.$route.params.roomId)

      this.privateChannel = this.$store.getters.getPrivatePusherInstance.subscribe(`private-${this.$route.params.roomId}`)

    },

    gotMedia(stream) {
      // var isInitiator = false;
      // var hasAnswer = false;
      // console.log("pusher before", this.pusher);

      

      // console.log("pusher after", this.pusher);

      // this.presenceChannel = this.pusher.subscribe(
      //   "presence-connection-channel"
      // );

      let self = this;

      this.privateChannel.bind("pusher:subscription_succeeded", function() {
        console.log("New subscriber", self.privateChannel.members.count);
        self.startPeer(self.privateChannel.members.count, stream);
      });
    },

    startPeer(count, stream) {
      let ownVideo = this.$refs.ownVideo
      ownVideo.srcObject = stream
      ownVideo.play()

      if (count === 2) {
        this.isInitiator = true;
      }

      let self = this;

      this.privateChannel.bind("client-send-signal-event", function(data) {
        console.log("Clien Send Signal Event with data: ", data);
        self.p.signal(data.msg);
      });

      this.p = new SimplePeer({
        initiator: this.isInitiator,
        trickle: true,
        stream: stream
      });

      this.p.on("signal", function(data) {
        console.log("On signal listener with data: ", data);
        var triggered = self.privateChannel.trigger(
          "client-send-signal-event",
          {
            msg: JSON.stringify(data)
          }
        );
      });

      this.p.on("error", function(err) {
        console.log("error", err);
      });

      this.p.on("connect", function() {
        console.log("CONNECT");
      });

      this.p.on("data", function(data) {
        console.log("data: " + data);
      });

      this.p.on("stream", function(stream) {
        console.log("GOT STREAM");
        let video = self.$refs.streamVideo;
        video.srcObject = stream;
        video.play();
      });
    }
  },
  mounted() {
    // get video/voice stream
    navigator.getUserMedia(
      { video: true, audio: true },
      this.gotMedia,
      function(err) {
        console.log("MEDIA ERROR", err);
      }
    );
  },
  created () {
    this.initializePusher()
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

