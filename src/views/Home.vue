<template>
  <div class="home">
    <Person :person="person" v-if="usersPeople && index !== 0" v-for="(person, index) in usersPeople" :key="person.id"/>
  </div>
</template>

<script>
import axios from 'axios'
import Pusher from 'pusher-js'
import variables from '@/variables'

import Person from '@/components/home/Person.vue'

export default {
  name: 'home',
  components: {
    Person
  },
  data () {
    return {
      registredServiceWorker: null,
      onlineUsers: []
    }
  },
  computed: {
    token () {
      return this.$store.getters.getToken
    },

    currentUser () {
      if (this.$store.getters.getCurrentUser._embedded) {
        return this.$store.getters.getCurrentUser._embedded.person
      } else {
        return {
          first_name: '',
          last_name: ''
        }
      }
    },

    usersPeople () {
      if (this.$store.getters.getUsersPeople._embedded) {
        return this.$store.getters.getUsersPeople._embedded.items
      } else {
        return []
      }
    }
  },
  methods: {
    getCurrentUser () {
      return axios.get(variables.userEndpoint, {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    getPeople () {
      return axios.get(variables.peopleEndpoint, {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    initializePusher (id) {
      let presencePusher = new Pusher('8dc95d49e9a8f15e0980', {
        cluster: 'eu',
        encrypted: true,
        authEndpoint: variables.pusherPresence,
        auth: {
          params: { id: id }
        }
      })

      this.$store.dispatch('initPresencePusher', {
        pusher: presencePusher
      })

      let allUsersChannel = this.$store.getters.getPresencePusherInstance.subscribe('presence-all')

      this.$store.dispatch('initAllUsersChannel', {
        channel: allUsersChannel
      })

      allUsersChannel.bind('pusher:subscription_succeeded', (members) => {
       console.log('Successfully subscribed!')
       members.each(member => {
          console.log(member.id)
          this.$store.dispatch('addOnlineMember', {
            memberId: member.id
          })
        })
      })

      allUsersChannel.bind('pusher:member_added', (member) => {
        console.log('New Member!', member.id)
        this.$store.dispatch('addOnlineMember', {
          memberId: member.id
        })
      })
    },

    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },

    getNotificationPermissionState () {
      if (navigator.permissions) {
        return navigator.permissions.query({name: 'notifications'})
        .then(result => {
          return result.state
        })
      }

      return new Promise(resolve => {
        resolve(Notification.permission)
      })
    },

    registerServiceWorker () {
      this.registredServiceWorker = navigator.serviceWorker.register('service-worker.js', { scope: '/' })
      return this.registredServiceWorker
      .then(registration => {
        return this.askPermission()
        .then(this.subscribeUserToPush())
      })
      .catch(error => {
        console.error('Unable to register service worker', error)
      })
    },

    askPermission () {
      return new Promise((resolve, reject) => {
        const permissionResult = Notification.requestPermission(result => {
          resolve(result)
        })

        if (permissionResult) {
          permissionResult.then(resolve, reject)
        }
      })
      .then(permissionResult => {
        if (permissionResult !== 'granted') {
          throw new Error('Permission was not granted')
        }
      })
    },

    subscribeUserToPush () {
      return this.registredServiceWorker
      .then(registration => {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            variables.applicationServerKey
          )
        }

        return registration.pushManager.subscribe(subscribeOptions)
      })
      .then(pushSubscription => {
        this.sendSubscriptionToBackend(pushSubscription)
        return pushSubscription
      })
    },

    sendSubscriptionToBackend(subsciption) {
      let bundledSub = JSON.parse(JSON.stringify(subsciption))

      return axios({
        method: 'POST',
        url: variables.pushSubEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: this.$store.getters.getCurrentUser.person_id,
          endpoint: bundledSub.endpoint,
          keys: {
            auth: bundledSub.keys.auth,
            p256dh: bundledSub.keys.p256dh
          }
        }
      })
      .then(response => {
        if (!response.status === 200) {
          throw new Error('Bad status code from server')
        }

        // return JSON.parse(response.data)
        return response

      })
      .then(responseData => {
        if (!(responseData.data && responseData.data.data.success)) {
          throw new Error('Bad response from server.')
        }
      })
      .catch(err => {
        console.error('Error saving subscription', err)
      })
    }
  },
  created () {
    if (this.token) {
      axios.all([this.getCurrentUser(), this.getPeople()])
      .then(axios.spread((currentUser, people) => {
        console.log(currentUser.data)

        this.$store.dispatch('addPeople', {
          currentUser: currentUser.data,
          people: people.data
        })

        this.initializePusher(currentUser.data.person_id)

        if (('serviceWorker' in navigator) && ('PushManager' in window)) {
          this.registerServiceWorker()
        } else {
          console.log('BROWSER DOES NOT SUPPORT PUSH NOTIFICATIONS')
        }
      }))
    }
  }
}
</script>
