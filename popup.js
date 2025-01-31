// Ouvir mensagens do background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'resetSuccessMessage') {
      document.getElementById('successMessage').classList.add('hidden');
    }
  });
  
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('addWater').addEventListener('click', addWater);
  document.getElementById('copyPixButton').addEventListener('click', copyPixKey);
  document.getElementById('toggleNotifications').addEventListener('click', toggleNotifications);
  
  // Inicializar gráfico
  const ctx = document.getElementById('waterChart').getContext('2d');
  let waterChart;
  
  // Carregar configurações salvas e inicializar gráfico
  chrome.storage.sync.get(['waterGoal', 'notificationInterval', 'consumedWater', 'notificationsPaused'], function(data) {
    document.getElementById('waterGoal').value = data.waterGoal || 2.0;
    document.getElementById('notificationInterval').value = data.notificationInterval || 30;
    document.getElementById('consumedWater').textContent = data.consumedWater || 0;
  
    // Inicializar gráfico
    updateChart(data.consumedWater || 0, data.waterGoal || 2.0);
  
    // Atualizar texto do botão de notificações
    const button = document.getElementById('toggleNotifications');
    if (data.notificationsPaused) {
      button.textContent = '▶️ Retomar Notificações';
    } else {
      button.textContent = '⏸️ Pausar Notificações';
    }
  });
  
  // Atualizar gráfico
  function updateChart(consumedWater, waterGoal) {
    if (waterChart) {
      waterChart.destroy();
    }
  
    waterChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Água Consumida', 'Meta'],
        datasets: [{
          label: 'Litros',
          data: [consumedWater, waterGoal],
          backgroundColor: ['#4CAF50', '#ccc'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Salvar configurações
  function saveSettings() {
    const waterGoal = parseFloat(document.getElementById('waterGoal').value);
    const notificationInterval = parseInt(document.getElementById('notificationInterval').value);
  
    chrome.storage.sync.set({ waterGoal, notificationInterval }, function() {
      chrome.alarms.clear('waterReminder', () => {
        chrome.alarms.create('waterReminder', { periodInMinutes: notificationInterval });
      });
      // Mostrar mensagem de sucesso
      const saveMessage = document.getElementById('saveMessage');
      saveMessage.classList.remove('hidden');
      setTimeout(() => saveMessage.classList.add('hidden'), 3000); // Oculta após 3 segundos
      updateChart(parseFloat(document.getElementById('consumedWater').textContent), waterGoal);
    });
  }
  // Adicionar água consumida
  function addWater() {
    const amount = parseFloat(document.getElementById('waterAmount').value);
    if (!isNaN(amount) && amount > 0) {
      chrome.storage.sync.get(['consumedWater', 'waterGoal'], function(data) {
        const consumedWater = (data.consumedWater || 0) + amount;
        chrome.storage.sync.set({ consumedWater }, function() {
          document.getElementById('consumedWater').textContent = consumedWater.toFixed(2);
          document.getElementById('waterAmount').value = ''; // Limpa o campo de entrada
          updateChart(consumedWater, data.waterGoal || 2.0);
          if (consumedWater >= data.waterGoal) {
            document.getElementById('successMessage').classList.remove('hidden'); // Mostra a mensagem
          }
        });
      });
    } else {
      alert('Por favor, insira um valor válido e maior que zero.');
    }
  }
  
  // Copiar chave PIX
  function copyPixKey() {
    const pixKey = document.getElementById('pixKey').textContent;
    navigator.clipboard.writeText(pixKey).then(() => {
      const copyMessage = document.createElement('div');
      copyMessage.className = 'copy-message';
      copyMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Chave PIX copiada!
      `;
      document.body.appendChild(copyMessage);
      
      setTimeout(() => {
        copyMessage.remove();
      }, 2000);
    }).catch(() => {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'copy-message';
      errorMessage.innerHTML = `
        <i class="fas fa-times-circle"></i>
        Erro ao copiar!
      `;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 2000);
    });
  }
  
  // Pausar/Retomar notificações
  function toggleNotifications() {
    chrome.storage.sync.get(['notificationsPaused'], function(data) {
      const notificationsPaused = !data.notificationsPaused;
      chrome.storage.sync.set({ notificationsPaused }, function() {
        const button = document.getElementById('toggleNotifications');
        if (notificationsPaused) {
          chrome.alarms.clear('waterReminder');
          button.textContent = '▶️ Retomar Notificações';
        } else {
          chrome.storage.sync.get(['notificationInterval'], function(data) {
            chrome.alarms.create('waterReminder', { periodInMinutes: data.notificationInterval });
            button.textContent = '⏸️ Pausar Notificações';
          });
        }
      });
    });
  }