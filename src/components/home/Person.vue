<template>
<div class="person">
  <div class="person-image">
    <img src="" alt="">
  </div>
  <span v-if="getOnlineMembers.indexOf(person.id.toString()) > -1">ONLINE</span>
  <button class="btn-secondary" @click="callPerson(person.id)">{{person.first_name}} {{person.last_name}}</button>
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

<style lang="scss" scoped>
span {
  line-height: 1;
  transition: all 230ms;
  cursor: pointer;

  &:hover {
    font-weight: bold;
  }
}
</style>

