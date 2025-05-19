// --- Funções Auxiliares ---

// Função para preencher os campos do formulário com os dados do endereço
function preencherCamposEndereco(dados) {
    document.getElementById('logradouro').value = dados.logradouro || '';
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

// Função para exibir mensagens (erro, sucesso, etc.)
// O parâmetro 'tipo' permite estilizar a mensagem de forma diferente via CSS
function exibirMensagem(mensagem, tipo = 'erro') {
    const mensagemElement = document.getElementById('mensagem');
    mensagemElement.textContent = mensagem;
    // Adiciona classes CSS para estilização (ex: 'mensagem-erro', 'mensagem-sucesso')
    mensagemElement.className = `mensagem mensagem-${tipo}`;
    
    // Mostra ou esconde o elemento da mensagem dependendo se há conteúdo
    if (mensagem) {
        mensagemElement.style.display = 'block';
    } else {
        mensagemElement.style.display = 'none';
    }
}

// Função específica para exibir mensagens de erro (chama exibirMensagem com tipo 'erro')
function exibirMensagemErro(mensagem) {
    exibirMensagem(mensagem, 'erro');
}

// Função para exibir o indicador de carregamento e desabilitar o botão de busca
function exibirIndicadorCarregamento() {
    document.getElementById('mensagem-carregando').style.display = 'block';
    // Seleciona o botão de submit do formulário
    document.querySelector('#form-cep button[type="submit"]').disabled = true; 
}

// Função para esconder o indicador de carregamento e reabilitar o botão de busca
function esconderIndicadorCarregamento() {
    document.getElementById('mensagem-carregando').style.display = 'none';
    // Reabilita o botão de submit do formulário
    document.querySelector('#form-cep button[type="submit"]').disabled = false;
}

// --- Lógica Principal de Busca de CEP ---

// Função assíncrona para buscar o CEP na API do ViaCEP
async function buscarCep() {
    const cepInput = document.getElementById('cep');
    // Remove todos os caracteres não numéricos do CEP (para enviar à API)
    const cepParaAPI = cepInput.value.replace(/\D/g, '');

    // Limpa qualquer mensagem de erro anterior ao iniciar uma nova busca
    exibirMensagemErro('');

    // Validação básica do CEP (deve ter 8 dígitos)
    if (cepParaAPI.length !== 8) {
        exibirMensagemErro('CEP inválido. Digite 8 dígitos numéricos.');
        limparCamposEndereco();
        return; // Interrompe a execução se o CEP for inválido
    }

    // Mostra o indicador de carregamento antes de fazer a requisição
    exibirIndicadorCarregamento();

    // Monta a URL da API do ViaCEP com o CEP informado
    const apiUrl = `https://viacep.com.br/ws/${cepParaAPI}/json/`;

    try {
        // Faz a requisição HTTP GET para a API usando fetch()
        const response = await fetch(apiUrl);

        // Verifica se a resposta da requisição foi bem sucedida (status 2xx)
        if (!response.ok) {
            // Tratamento específico para status 400 (Bad Request), embora a ViaCEP use "erro: true"
            if (response.status === 400) {
                throw new Error('Formato de CEP inválido na requisição.');
            }
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        // Converte a resposta para um objeto JavaScript (JSON)
        const data = await response.json();

        // Verifica se a API retornou um erro (CEP não encontrado)
        if (data.erro) {
            exibirMensagemErro('CEP não encontrado.');
            limparCamposEndereco();
        } else {
            // Preenche os campos do formulário com os dados do endereço
            preencherCamposEndereco(data);
            // Opcional: exibir uma mensagem de sucesso se desejar
            // exibirMensagem('Endereço encontrado com sucesso!', 'sucesso');
        }
    } catch (error) {
        // Captura e trata erros que podem ocorrer durante a requisição ou processamento
        console.error('Erro ao buscar CEP:', error);
        exibirMensagemErro('Ocorreu um erro ao buscar o CEP: ' + error.message);
        limparCamposEndereco();
    } finally {
        // Garante que o indicador de carregamento seja sempre escondido no final
        esconderIndicadorCarregamento();
    }
}

// --- Event Listeners ---

// Adiciona um ouvinte de evento para formatar o CEP enquanto o usuário digita (máscara)
document.getElementById('cep').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    // Adiciona o hífen após o 5º dígito, se houver mais dígitos
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
});

// Adiciona um ouvinte de evento para o envio do formulário
// Isso é mais semântico e permite o envio com a tecla Enter
document.getElementById('form-cep').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página
    buscarCep(); // Chama a função que busca o CEP
});