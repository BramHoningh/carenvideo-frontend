self.addEventListener('push', function(event) {
  console.log('RECEIVED PUSH NOTIFICATION', event)
  
  if (event.data) {
    console.log('This push event has data: ', event.data.text());
  } else {
    console.log('This push event has no data.');
  }
});