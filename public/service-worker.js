self.addEventListener('push', function(event) {
  console.log('RECEIVED PUSH NOTIFICATION', event)
  
  const promiseChain = self.registration.showNotification('Hello, World.');
  
  event.waitUntil(promiseChain);
});