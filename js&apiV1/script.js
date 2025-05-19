// Função que será chamada ao clicar no botão
function buscarCep() {
    // 1. Pegar o valor do CEP digitado pelo usuário
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // 2. Validar se o CEP tem 8 dígitos
    if (cep.length !== 8) {
        exibirMensagemErro('CEP inválido. Digite 8 dígitos.');
        limparCamposEndereco(); // Limpa campos caso CEP inválido
        return; // Interrompe a execução da função
    }

    // 3. Montar a URL da API com o CEP informado
    const apiUrl = `https://viacep.com.br/ws/${cep}/json/`;

    // 4. Fazer a requisição usando fetch()
    fetch(apiUrl)
        .then(response => {
            // Verifica se a resposta da requisição foi bem sucedida (status 200)
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            // Converte a resposta para JSON
            return response.json();
        })
        .then(data => {
            // 5. Tratar os dados retornados pela API
            if (data.erro) {
                // Se a API retornar erro (CEP não encontrado)
                exibirMensagemErro('CEP não encontrado.');
                limparCamposEndereco();
            } else {
                // Se o CEP for encontrado, preencher os campos do formulário
                preencherCamposEndereco(data);
                exibirMensagemErro(''); // Limpa qualquer mensagem de erro anterior
            }
        })
        .catch(error => {
            // 6. Tratar possíveis erros na requisição (rede, API fora do ar, etc.)
            console.error('Erro ao buscar CEP:', error);
            exibirMensagemErro('Ocorreu um erro ao buscar o CEP. Tente novamente.');
            limparCamposEndereco();
        });
}

// Função para preencher os campos do formulário com os dados do endereço
function preencherCamposEndereco(dados) {
    document.getElementById('logradouro').value = dados.logradouro || ''; // || '' para garantir que não seja null/undefined
    document.getElementById('bairro').value = dados.bairro || '';
    document.getElementById('localidade').value = dados.localidade || '';
    document.getElementById('uf').value = dados.uf || '';
}

// Função para limpar os campos do formulário de endereço
function limparCamposEndereco() {
    document.getElementById('logradouro').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('localidade').value = '';
    document.getElementById('uf').value = '';
}

// Função para exibir mensagens de erro
function exibirMensagemErro(mensagem) {
    document.getElementById('mensagem-erro').textContent = mensagem;
}