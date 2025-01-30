document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('addWater').addEventListener('click', addWater);
document.getElementById('copyPixButton').addEventListener('click', copyPixKey);

// Inicializar gráfico
const ctx = document.getElementById('waterChart').getContext('2d');
let waterChart;

// Carregar configurações salvas e inicializar gráfico
chrome.storage.sync.get(['waterGoal', 'notificationInterval', 'consumedWater'], function(data) {
  document.getElementById('waterGoal').value = data.waterGoal || 2.0;
  document.getElementById('notificationInterval').value = data.notificationInterval || 30;
  document.getElementById('consumedWater').textContent = data.consumedWater || 0;

  // Inicializar gráfico
  updateChart(data.consumedWater || 0, data.waterGoal || 2.0);
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
    chrome.runtime.sendMessage({ action: 'updateAlarm', interval: notificationInterval });
    alert('Configurações salvas!');
    updateChart(parseFloat(document.getElementById('consumedWater').textContent), waterGoal);
  });
}

// Adicionar água consumida
function addWater() {
  const amount = parseFloat(prompt('Quantos litros de água você bebeu?'));
  if (!isNaN(amount) && amount > 0) {
    chrome.storage.sync.get(['consumedWater', 'waterGoal'], function(data) {
      const consumedWater = (data.consumedWater || 0) + amount;
      chrome.storage.sync.set({ consumedWater }, function() {
        document.getElementById('consumedWater').textContent = consumedWater.toFixed(2);
        updateChart(consumedWater, data.waterGoal || 2.0);
        if (consumedWater >= data.waterGoal) {
          alert('Parabéns! Você atingiu sua meta diária de água.');
        }
      });
    });
  }
}

// Copiar chave PIX
function copyPixKey() {
  const pixKey = document.getElementById('pixKey').textContent;
  navigator.clipboard.writeText(pixKey).then(() => {
    alert('Chave PIX copiada para a área de transferência!');
  }).catch(() => {
    alert('Erro ao copiar a chave PIX.');
  });
}