// Criar alarme para notificações
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateAlarm') {
      chrome.alarms.create('waterReminder', { periodInMinutes: message.interval });
    }
  });
  
  // Mostrar notificação quando o alarme disparar
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'waterReminder') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Hora de beber água!',
        message: 'Não se esqueça de beber água e mantenha-se hidratado.'
      });
    }
  });
  
  // Resetar o consumo de água diariamente à meia-noite
  chrome.alarms.create('resetConsumption', { when: getNextMidnight() });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'resetConsumption') {
      chrome.storage.sync.set({ consumedWater: 0 });
      chrome.alarms.create('resetConsumption', { when: getNextMidnight() });
    }
  });
  
  function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight.getTime();
  }