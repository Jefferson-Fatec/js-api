// ... funções anteriores ...

// Adiciona um evento para formatar o CEP enquanto o usuário digita
document.getElementById('cep').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove não dígitos
    value = value.replace(/^(\d{5})(\d)/, '$1-$2'); // Adiciona o hífen depois do 5º dígito
    e.target.value = value;
});


function buscarCep() {
    const cepInput = document.getElementById('cep');
    // Agora o replace para pegar APENAS os dígitos continua importante para a API
    const cepParaAPI = cepInput.value.replace(/\D/g, '');

    // A validação agora verifica se, após remover não dígitos, temos 8 caracteres
    if (cepParaAPI.length !== 8) {
        exibirMensagemErro('CEP inválido. Digite 8 dígitos numéricos.');
        limparCamposEndereco();
        return;
    }

    exibirMensagemErro('');
    exibirIndicadorCarregamento();

    // Usa o cepParaAPI na URL
    const apiUrl = `https://viacep.com.br/ws/${cepParaAPI}/json/`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // Pode adicionar validação para CEPs com formato inválido aqui também
                if (response.status === 400) {
                     throw new Error('Formato de CEP inválido na requisição.');
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.erro) {
                exibirMensagemErro('CEP não encontrado.');
                limparCamposEndereco();
            } else {
                preencherCamposEndereco(data);
                exibirMensagemErro('');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            // Mensagem de erro mais genérica ou específica dependendo do erro
            exibirMensagemErro('Ocorreu um erro ao buscar o CEP: ' + error.message);
            limparCamposEndereco();
        })
        .finally(() => {
            esconderIndicadorCarregamento();
        });
}

// ... restante do código JavaScript