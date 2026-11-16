/** Formulário de mapeamento vocacional. */
const formulario = document.querySelector('#form-perfil');
const botaoEnviar = document.querySelector('#botao-enviar');
const modalIndisponivel = document.querySelector('#modal-indisponivel');
const mensagemModal = document.querySelector('#modal-mensagem');

const separarItens = (texto) => texto.split(',').map((item) => item.trim()).filter(Boolean);

const mostrarErro = (mensagem) => {
  mensagemModal.textContent = mensagem;
  modalIndisponivel.showModal();
};

const validarLista = (campo) => {
  const itens = separarItens(campo.value);
  campo.setCustomValidity(itens.length ? '' : 'Informe pelo menos um item válido, separado por vírgulas.');
  return itens;
};

['nome', 'hobbies', 'interesses'].forEach((nomeCampo) => {
  formulario.elements[nomeCampo].addEventListener('input', (evento) => {
    evento.target.setCustomValidity('');
  });
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nome = formulario.elements.nome.value.trim();
  const hobbies = validarLista(formulario.elements.hobbies);
  const interesses = validarLista(formulario.elements.interesses);
  if (nome.length < 2) {
    formulario.elements.nome.setCustomValidity('Informe um nome com pelo menos 2 caracteres.');
    formulario.elements.nome.reportValidity();
    return;
  }
  formulario.elements.nome.setCustomValidity('');
  if (!hobbies.length) { formulario.elements.hobbies.reportValidity(); return; }
  if (!interesses.length) { formulario.elements.interesses.reportValidity(); return; }
  if (!CONFIG.API_URL.trim()) {
    mostrarErro('O serviço de análise ainda não está disponível. Tente novamente mais tarde.');
    return;
  }
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = 'Analisando seu perfil...';
  const controlador = new AbortController();
  const tempoLimite = setTimeout(() => controlador.abort(), CONFIG.TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, hobbies, interests: interesses }),
      signal: controlador.signal,
    });
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
    const dados = await resposta.json();
    if (!dados || typeof dados.user_name !== 'string' || typeof dados.career_identity_statement !== 'string' || !Array.isArray(dados.recommended_careers)) {
      throw new Error('Resposta da API em formato inesperado');
    }
    sessionStorage.setItem(CONFIG.CHAVE_RESULTADO, JSON.stringify(dados));
    window.location.href = 'resultado.html';
  } catch (erro) {
    console.error('Erro na análise:', erro);
    mostrarErro(erro.name === 'AbortError'
      ? 'A análise demorou mais do que o esperado. Tente novamente em alguns instantes.'
      : 'Não foi possível concluir a análise agora. Seus dados continuam preenchidos. Tente novamente mais tarde.');
  } finally {
    clearTimeout(tempoLimite);
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = 'Descobrir minha carreira';
  }
});
