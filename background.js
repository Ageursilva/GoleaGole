// Verificar se o objetivo foi atingido e parar notificações
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.consumedWater) {
      chrome.storage.sync.get(['consumedWater', 'waterGoal'], (data) => {
        if (data.consumedWater >= data.waterGoal) {
          chrome.alarms.clear('waterReminder'); // Para o alarme
        }
      });
    }
  });
  
  // Mostrar notificação quando o alarme disparar
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'waterReminder') {
      chrome.storage.sync.get(['consumedWater', 'waterGoal', 'notificationsPaused'], (data) => {
        if (data.consumedWater < data.waterGoal && !data.notificationsPaused) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Hora de beber água!',
            message: 'Não se esqueça de beber água e mantenha-se hidratado.'
          });
        }
      });
    }
  });
  
  // Resetar o consumo de água diariamente à meia-noite
  chrome.alarms.create('resetConsumption', { when: getNextMidnight() });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'resetConsumption') {
      chrome.storage.sync.set({ consumedWater: 0 }, function() {
        chrome.alarms.create('resetConsumption', { when: getNextMidnight() });
        chrome.alarms.get('waterReminder', (existingAlarm) => {
          if (!existingAlarm) {
            chrome.storage.sync.get(['notificationInterval'], (data) => {
              chrome.alarms.create('waterReminder', { periodInMinutes: data.notificationInterval || 30 });
            });
          }
        });
        // Envia mensagem para ocultar a mensagem de sucesso no popup
        chrome.runtime.sendMessage({ action: 'resetSuccessMessage' });
      });
    }
  });
  
  function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight.getTime();
  }