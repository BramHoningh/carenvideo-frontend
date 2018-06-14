<template>
<div class="room">
  <div class="video-container">
    <video class="streamVideo" ref="streamVideo" autoplay></video>
    <div v-if="getPersonCallingId && showCallingText" class="calling-text">Je belt {{ personCalling }}...</div> 
    <video class="ownVideo" ref="ownVideo" autoplay muted></video>
    <div class="hangup-container">
      <div class="icon"></div>
      <button class="button" @click="hangup">Ophangen</button>
    </div>   
  </div>
  <div class="video-sidebar">
    <div class="header">
      <span>Mijn Notities</span>
    </div>
    <div class="oldnotes-container">
      <div>

      </div>
      <div class="new-note-container">

      </div>
    </div>
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
      id: null,
      personCalling: '',
      showCallingText: true
    };
  },
  computed: {
    privateChannel () {
      return this.$store.getters.getPrivateChannel
    },

    getPusherChannel () {
      return this.$store.getters.getAllUsersChannel
    },

    getCurrentUserId () {
      return this.$store.getters.getCurrentUser.person_id
    },

    getOnlineMembers () {
      return this.$store.getters.getOnlineMembers
    },

    getPersonCallingId () {
      return this.$store.getters.getPersonCallingId
    },

    getCalledById () {
      return this.$store.getters.getCalledById
    },

    getUsersPeople () {
      return this.$store.getters.getUsersPeople._embedded.items
    },
  },
  methods: {
    hangup () {
      let id = (this.getPersonCallingId) ? this.getPersonCallingId : this.getCalledById

      this.getPusherChannel.trigger('client-stop-call-event', {
        id: id
      })

      this.$router.push('/')
    },

    initializePusher (stream) {
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
        let isInitiator = (privateChannel.members.count === 2) ? true : false
        self.startStream(stream, isInitiator, privateChannel)        
      });

      privateChannel.bind('pusher:subscription_error', function(status) {
        console.log(status)
      });

    },

    startStream(stream, isInitiator, channel) {
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
        this.showCallingText = false
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

    this.getPusherChannel.bind('client-decline-call-event', (data) => {
      if (data.id === this.getCurrentUserId) {  
        this.$router.push('/')
      }
    })

    this.getPusherChannel.bind('client-stop-call-event', (data) => {
      if (data.id === this.getCurrentUserId) {  
        this.$router.push('/')
      }
    })

    if (this.getPersonCallingId) {
      let person = this.getUsersPeople.find(person => person.id === this.getPersonCallingId)

      this.personCalling = person.first_name + " " + person.last_name
    }
  },
  created () {
    // if (!this.getPusherChannel) {
    //   this.$router.push('/')
    // }

    if (this.$store.getters.getToken && !this.$store.getters.getCurrentUser.person_id) {
      axios.get('https://www.carenzorgt.nl/api/v1/user', {
        headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken }
      })
      .then(response => {
        this.id = response.data.person_id

        this.$store.dispatch('addCurrentUser', {
          currentUser: response.data
        })

        this.$store.getters.getCurrentUser
      })
      .catch(error => {
        console.error(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/styles/all";

.calling-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-family: 'Open Sans';
  font-size: 3em;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #ffffff;
}

.room {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;

  .video-container {
    z-index: 0;

    video.streamVideo {
      height: 100%;
      width: 100%;
      background-color: $caren-gradient;
      z-index: 0;
      margin: 0 auto;
      display: block;
      text-align: center;
    }

    video.ownVideo {
      position: absolute;
      top: 15px;
      left: 10px;
      min-width: 300px;
      max-width: 420px;
      min-height: 169px;
      border-radius: 7px;
      background-color: #a6a6a6;
      border: solid 4px #ffffff;
      z-index: 0;
    }

    .hangup-container {
      bottom: 35px;
      position: absolute;
      max-width: 315px;
      width: 315px;
      z-index: 100;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;

      .icon {
        position: absolute;
        width: 90px;
        height: 90px;
        right: 0;
        transform: translateY(-50%);
        top: 50%;
        background-color: #cf145a;
        border: solid 5px #ffffff;
        border-radius: 100%;
        z-index: 100;
      }
      .button {
        max-width: 225px;
        height: 60px;
        box-sizing: border-box;
        margin: 0;
        min-width: auto;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        background-color: #ffffff;
        font-family: Lato;
        line-height: 18px;
        font-size: 36px;
        font-weight: 800;
        color: #cf145a;
      }
    }
  }
  .video-sidebar {
    display: none;
    z-index: 100;
    .header {
      z-index: 100;
      width: 100%;
      height: 70px;
      background-color: #ffffff;
      border-bottom-left-radius: 15px;
    }
    .oldnotes-container {
      background-color: #a6a6a6;
      height: 50%;
      width: 100%;
      float: right;
    }
  }
}
</style>

