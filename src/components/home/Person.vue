<template>
<div class="person">
  <span @click="callPerson(person.id)">{{person.first_name}} {{person.last_name}}</span>
</div>
</template>

<script>
export default {
  name: 'person',
  props: ['person'],
  methods: {
    callPerson (id) {
      axios({
        method: 'POST',
        url: variables.pushTriggerEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: id,
          title: `${this.$store.getters.getCurrentUser._embedded.person.first_name} belt jou!`,
          message: 'Neem op om een video gesprek te beginnen.'
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.$router.push(`to-room/${id}`)
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

