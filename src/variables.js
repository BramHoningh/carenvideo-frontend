const variables = {
  clientId: '6a38d19e07d34c5ee51f349475b8c580897af536b875c591bfeb83752e12c98e',
  redirectUri: 'http://localhost:8080/oauth',
  // pushSubEndpoint: 'https://c.patrickattema.nl/push/subscribe',
  pushSubEndpoint: 'http://localhost:9012/api/save-subscription/',
  pushTriggerEndpoint: 'http://localhost:9012/api/trigger-push-msg/',
  // pusherPresence: 'https://c.patrickattema.nl/pusher/auth/presence',
  pusherPresence: 'http://localhost:9012/pusher/auth/presence',
  // pusherPrivate: 'https://c.patrickattema.nl/pusher/auth/private',
  pusherPrivate: 'http://localhost:9012/pusher/auth/private'
}

export default variables
