self.addEventListener('push', function(event) {
  let eventData = event.data.json()
  
  const promiseChain = self.registration.showNotification(eventData.title, {
    body: eventData.message,
    icon: './CV512x512.png',
    badge: './CV128x128.png',
    data: {
      url: `http://localhost:8080/to-room/${eventData.id_link}`
    },
    requireInteraction: true,
    actions: [
      {
        action: 'opnemen-action',
        title: 'Opnemen',
        icon: './Opnemen16x16.png'
      },
      {
        action: 'afwijzen-action',
        title: 'Afwijzen',
        icon: './Ophangen16x16.png'
      }
    ]
  });
  
  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  switch (event.action) {
    case 'opnemen-action':
      openUrl(event.notification.data.url)
    break;

    case 'afwijzen-action':
      console.log('AFWIJZEN')
    break;

    default:
      openUrl(event.notification.data.url)
    break;
  }

  function openUrl(url) {
    event.waitUntil(clients.matchAll({
      type: "window"
    }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == url && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow(url);
    }));
  }
});