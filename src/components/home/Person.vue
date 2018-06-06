<template>
  <div class="person" @click="callPerson(person.id)">
    <div class="person-image">
      <img src="../../assets/images/person-icon.svg" alt="">
    </div>
    <span class="person-status" v-if="getOnlineMembers.indexOf(person.id.toString()) > -1">ONLINE</span>
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
    }
  },
  methods: {
    callPerson (id) {
      let idLink = new Hashids().encode(id)
      console.log(idLink)

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
          // this.$router.push(`to-room/${idLink}`)
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

