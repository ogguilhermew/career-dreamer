/** Renderização do resultado recebido da API ou dos dados de exemplo. */
const secaoResultado = document.querySelector('#resultado');
const secaoVazia = document.querySelector('#sem-resultado');
const listaCarreiras = document.querySelector('#lista-carreiras');
const modeloCarreira = document.querySelector('#modelo-carreira');

const obterDados = () => {
  if (new URLSearchParams(window.location.search).has('exemplo')) return DADOS_EXEMPLO;
  try {
    return JSON.parse(sessionStorage.getItem(CONFIG.CHAVE_RESULTADO));
  } catch (erro) {
    console.error('Resultado armazenado inválido:', erro);
    return null;
  }
};

const dados = obterDados();
if (!dados || typeof dados.user_name !== 'string' || typeof dados.career_identity_statement !== 'string' || !Array.isArray(dados.recommended_careers) || dados.recommended_careers.length === 0) {
  secaoVazia.hidden = false;
} else {
  document.querySelector('#nome-usuario').textContent = dados.user_name;
  document.querySelector('#sintese').textContent = dados.career_identity_statement;
  const carreiras = [...dados.recommended_careers].sort((a, b) => Number(b.match_score) - Number(a.match_score));
  carreiras.forEach((carreira, indice) => {
    const elemento = modeloCarreira.content.firstElementChild.cloneNode(true);
    const nota = Math.max(0, Math.min(100, Number(carreira.match_score) || 0));
    elemento.querySelector('.carreira__titulo').textContent = carreira.title ?? '';
    elemento.querySelector('.carreira__percentual').textContent = `${nota}%`;
    elemento.querySelector('.barra__nivel').style.setProperty('--nivel', `${nota}%`);
    elemento.querySelector('.carreira__resumo').textContent = carreira.summary ?? '';
    if (indice === 0) {
      elemento.classList.add('carreira--principal');
      elemento.querySelector('.carreira__selo').hidden = false;
    }
    (Array.isArray(carreira.key_skills) ? carreira.key_skills : []).forEach((habilidade) => {
      const item = document.createElement('li');
      item.textContent = habilidade;
      elemento.querySelector('.chips').appendChild(item);
    });
    (Array.isArray(carreira.learning_path) ? carreira.learning_path : []).forEach((passo) => {
      const item = document.createElement('li');
      item.textContent = passo;
      elemento.querySelector('.roteiro').appendChild(item);
    });
    listaCarreiras.appendChild(elemento);
  });
  secaoResultado.hidden = false;
}
