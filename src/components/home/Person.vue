<template>
  <div class="person" :class="{'person-is-online': getOnlineMembers.indexOf(person.id.toString()) > -1}" @click="callPerson(person.id)">
    <div class="person-image">
      <img src="../../assets/images/person-icon.svg" alt="">
      <div class="person-status" :class="{'is-online': getOnlineMembers.indexOf(person.id.toString()) > -1}"></div>
    </div>
    <span class="person-name" >{{person.first_name}} {{person.last_name}}</span>
  </div>
</template>

<script>
import axios from 'axios'
import Hashids from 'hashids'
import variables from '@/variables.js'

export default {
  name: 'person',
  props: ['person', 'isOnline'],
  computed: {
    getOnlineMembers () {
      return this.$store.getters.getOnlineMembers
    },
    
    getCurrentUserId () {
      return this.$store.getters.getCurrentUser.person_id
    },

    getPusherChannel () {
      return this.$store.getters.getAllUsersChannel
    }
  },
  methods: {
    callPerson (id) {
      let idLink = new Hashids().encode(id)

      this.getPusherChannel.trigger('client-call-event', {
            id: id,
            called_by: this.getCurrentUserId
      })

      this.$store.dispatch('addCallingPersonID', {
        id: id
      })

      axios({
        method: 'POST',
        url: variables.pushTriggerEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: id,
          id_link: idLink,
          title: `${this.$store.getters.getCurrentUser._embedded.person.first_name} belt jou!`,
          message: 'Neem op om een video gesprek te beginnen.'
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.$router.push(`room/${idLink}`)
        }
      })
      .catch(err => {
        console.error(err)
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/all';
.person {
  pointer-events: none;
}

.person-is-online {
    cursor: pointer !important;
    pointer-events: all;
}
</style>


