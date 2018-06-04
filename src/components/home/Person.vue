<template>
<div class="person">
  <span @click="callPerson(person.id)">{{person.first_name}} {{person.last_name}}</span>
</div>
</template>

<script>
import axios from 'axios'
import SHA256 from 'crypto-js/sha256'
import variables from '@/variables.js'

export default {
  name: 'person',
  props: ['person'],
  methods: {
    callPerson (id) {
      let idLink = SHA256(id)

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
          this.$router.push(`to-room/${idLink}`)
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

