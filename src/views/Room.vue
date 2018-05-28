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

export default {
  name: 'room'
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

