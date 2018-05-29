<template>
  <div class="home">
    <li v-if="usersPeople && index !== 0" v-for="(person, index) in usersPeople" :key="person.id"><a @click="callPerson(12345)">{{person.first_name}} {{person.last_name}}</a></li>
  </div>
</template>

<script>
import axios from 'axios'
import Pusher from 'pusher-js'
import variables from '@/variables'

export default {
  name: 'home',
  data () {
    return {
      registredServiceWorker: null
    }
  },
  computed: {
    token () {
      return this.$store.state.token
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
    callPerson (id) {
      let triggered = this.$store.getters.getAllUsersChannel.trigger(`client-event-id-${id}`, {
        message: 'test'
      })
    },

    getCurrentUser () {
      return axios.get('https://www.carenzorgt.nl/api/v1/user', {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    getPeople () {
      return axios.get('https://www.carenzorgt.nl/api/v1/people', {
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
        console.log('Service Worker successfully registred!')
        this.askPermission()
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
            'BNHxHyF+hP+3rLMC8DsE8a2HMuALWLJNwOVZWOZ4M/oUUcW6Fld1YP/togFiA7sPxBWq1HlYaThG7VqlghcPkgU='
          )
        }

        return registration.pushManager.subscribe(subscribeOptions)
      })
      .then(pushSubscription => {
        console.log('Received PushSubscription:', JSON.stringify(pushSubscription))
        this.sendSubscriptionToBackend(pushSubscription)
        return pushSubscription
      })
    },

    sendSubscriptionToBackend(subsciption) {
      let bundleSubscription = JSON.parse(JSON.stringify(subsciption))

      return axios.post(variables.pushSubEndpoint, {
        user_id: this.$store.getters.getCurrentUser.person_id,
        endpoint: bundleSubscription.endpoint,
        keys: {
          p256dh: bundleSubscription.p256dh,
          auth: bundleSubscription.auth
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Bad status code from server')
        }

        return response.json()
      })
      .then(responseData => {
        if (!(responseData.data && responseData.data.success)) {
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
