// Teste da API de Reset de Senha
// Este script pode ser executado no console do navegador para testar a API

// Simular uma chamada para a API de reset de senha
const testResetPassword = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8000/users/${userId}/reset_password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Reset de senha bem-sucedido:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('Erro no reset de senha:', error);
      throw new Error(error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Para testar, chame no console:
// testResetPassword(1); // substitua 1 pelo ID do usuário
console.log('Script de teste carregado. Use testResetPassword(userId) para testar.');
