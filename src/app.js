'use strict';
(() => {
  const config = window.PETSHOP_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollTo = (element) => element.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  const safeUrl = (value, hosts = []) => {
    try { const url = new URL(value); return url.protocol === 'https:' && (!hosts.length || hosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) ? url.href : ''; } catch { return ''; }
  };
  const phone = /^\d{10,15}$/.test(config.whatsapp || '') ? config.whatsapp : '';
  let petType = 'dogs';
  let lastPrivacyFocus;

  // Navegação móvel: teclado, fechamento por Escape e retorno ao botão.
  const menuButton = $('.menu-toggle');
  const nav = $('#nav');
  function closeMenu(returnFocus = false) { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu'); if (returnFocus) menuButton.focus(); }
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
  $$('#nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { $$('#nav a').forEach(link => { const active = link.getAttribute('href') === '#' + entry.target.id; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    $$('main section[id]').forEach(section => sectionObserver.observe(section));
  }

  // Categorias para cães e gatos, sem estoque ou preços simulados.
  const productCopy = {
    dogs: { food: ['Nutrição na medida', 'Alimentos e petiscos para diferentes fases da vida do seu cão.'], play: ['Bora brincar?', 'Bolinhas, mordedores e companhia para gastar energia.'], walk: ['Prontos para passear', 'Guias, peitorais e acessórios para descobrir o mundo juntos.'], home: ['Cantinho de aconchego', 'Caminhas e itens de conforto para a soneca depois da diversão.'] },
    cats: { food: ['Nutrição para felinos', 'Alimentos secos, úmidos e petiscos para a rotina do seu gato.'], play: ['Instinto de diversão', 'Varinhas, bolinhas e arranhadores para explorar e brincar.'], walk: ['Uma rotina mais leve', 'Caixas de transporte e acessórios para sair com conforto.'], home: ['Reino da soneca', 'Caminhas, tocas e itens de higiene para o cantinho do seu gato.'] }
  };
  const careCopy = {
    dogs: { title: ['Banho & tosa', 'Higiene & bem-estar', 'Favoritos para toda hora'], copy: ['Limpeza e acabamento que respeitam a pelagem, o porte e o jeitinho do seu companheiro.', 'Cuidados de rotina e atenção aos detalhes para deixar o seu pet confortável no dia a dia.', 'Alimentação, brinquedos e acessórios para a hora de passear, brincar ou descansar.'], label: 'Carinho pensado para o seu cão.', caption: 'Um momento só para ele.' },
    cats: { title: ['Cuidado no ritmo felino', 'Escovação & conforto', 'Favoritos para felinos'], copy: ['Atenção à pelagem e ao temperamento, com os cuidados e a disponibilidade combinados antes da visita.', 'Delicadeza, pausas e respeito ao espaço do seu gato. Cada detalhe conta para uma experiência tranquila.', 'Alimentação, arranhadores e acessórios para explorar, brincar e se aconchegar.'], label: 'Delicadeza pensada para o seu gato.', caption: 'No tempo dele. Com todo carinho.' }
  };
  function animateIn(element, index = 0) {
    if (!element || prefersReducedMotion.matches || typeof element.animate !== 'function') return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate([{ opacity: .15, transform: 'translateY(16px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 460, delay: index * 45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  }
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    if (petType === button.dataset.pet) return;
    petType = button.dataset.pet;
    $$('.filter').forEach(item => { const active = item.dataset.pet === petType; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    $$('.pet-filter').forEach(group => { group.dataset.selected = petType; });
    Object.entries(productCopy[petType]).forEach(([key, copy]) => { $('#product-' + key + '-title').textContent = copy[0]; $('#product-' + key + '-copy').textContent = copy[1]; });
    const care = careCopy[petType];
    care.title.forEach((title, index) => { $('#care-title-' + (index + 1)).textContent = title; $('#care-copy-' + (index + 1)).textContent = care.copy[index]; });
    $('#care-pet-label').textContent = care.label;
    $('#care-image-caption').textContent = care.caption;
    ['dogs', 'cats'].forEach(pet => { const active = pet === petType; $('#care-' + pet).dataset.active = String(active); $('#care-' + pet).setAttribute('aria-hidden', String(!active)); });
    $$('.care-item, .product-card').forEach((element, index) => animateIn(element, index % 4));
  }));

  // Telas internas no mesmo HTML: URLs com fragmento funcionam também offline.
  // O histórico nativo preserva Voltar/Avançar e permite links diretos.
  let renderedHash = null;
  let activeView = null;
  const baseTitle = document.title;
  function renderRoute({ focus = true, focusSelector = '' } = {}) {
    const hash = window.location.hash || '#boas-vindas';
    const viewName = hash === '#boas-vindas' ? 'welcome' : hash === '#localizacao' ? 'location' : hash === '#contato' ? 'contact' : 'home';
    const changed = activeView !== viewName;
    activeView = viewName; renderedHash = window.location.hash;
    $$('.site-view').forEach(view => { view.hidden = view.dataset.view !== viewName; });
    const welcome = viewName === 'welcome';
    document.body.classList.toggle('welcome-mode', welcome);
    $$('.header, .announcement, .footer, .skip-link').forEach(element => { element.hidden = welcome; });
    const active = $('[data-view="' + viewName + '"]');
    document.title = viewName === 'home' ? baseTitle : ({ welcome: 'Boas-vindas', location: 'Localização', contact: 'Contato' }[viewName]) + ' | ' + (config.brand || 'Pata & Cia.');
    closeMenu();
    if (changed) animateIn(active);
    window.requestAnimationFrame(() => {
      let anchor = null;
      if (viewName === 'home' && !['#inicio', '#conteudo', '#boas-vindas'].includes(hash)) { try { anchor = document.querySelector(hash); } catch { /* Fragmentos desconhecidos abrem o início. */ } }
      if (anchor && active.contains(anchor)) scrollTo(anchor);
      else window.scrollTo({ top: 0, behavior: 'instant' });
      if (focus) {
        const target = focusSelector ? $(focusSelector) : anchor?.querySelector('h2, h3') || active.querySelector('h1');
        if (target) { if (!target.matches('input,textarea,select,button,a')) target.tabIndex = -1; target.focus({ preventScroll: true }); }
      }
    });
  }
  function navigate(hash, focusSelector = '') {
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    renderRoute({ focusSelector });
  }
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    event.preventDefault(); navigate(hash);
  }));
  window.addEventListener('popstate', () => renderRoute());
  window.addEventListener('hashchange', () => { if (window.location.hash !== renderedHash) renderRoute(); });

  // Abas com setas, Home e End; os painéis mantêm nomes acessíveis.
  const locationTabs = $$('.location-tabs [role=tab]');
  function activateTab(tab, focus = false) {
    locationTabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; $('#' + item.getAttribute('aria-controls')).hidden = !active; });
    if (focus) tab.focus();
  }
  locationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight') target = (index + 1) % locationTabs.length; else if (event.key === 'ArrowLeft') target = (index - 1 + locationTabs.length) % locationTabs.length; else if (event.key === 'Home') target = 0; else if (event.key === 'End') target = locationTabs.length - 1; if (target !== undefined) { event.preventDefault(); activateTab(locationTabs[target], true); } });
  });

  // Dados reais são opcionais. Em sua ausência, nenhuma empresa ou rota é inventada.
  if (config.address) { $('#store-address').textContent = config.address; $('#store-complement').textContent = config.addressComplement || 'Confirme com a equipe os detalhes da sua visita.'; $('#map-description').textContent = config.address; $('.location-art .eyebrow').textContent = 'VEM CONHECER DE PERTO'; }
  const mapsUrl = safeUrl(config.mapsUrl, ['google.com', 'maps.app.goo.gl', 'goo.gl']);
  if (mapsUrl || config.address) { const link = $('#maps-link'); link.href = mapsUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(config.address); link.hidden = false; }
  const embedUrl = safeUrl(config.mapsEmbed, ['google.com']);
  if (embedUrl && config.address) { const iframe = document.createElement('iframe'); iframe.src = embedUrl; iframe.title = 'Localização de ' + (config.brand || 'Pata & Cia.'); iframe.className = 'location-map-frame'; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer-when-downgrade'; iframe.setAttribute('allowfullscreen', ''); const container = $('#location-map'); container.replaceChildren(iframe); container.style.padding = '0'; }
  if (Array.isArray(config.hours) && config.hours.length) { const fragment = document.createDocumentFragment(); config.hours.forEach(hour => { if (!hour.days || !hour.time) return; const row = document.createElement('div'); row.className = 'hours-row'; const days = document.createElement('span'); days.textContent = hour.days; const time = document.createElement('strong'); time.textContent = hour.time; row.append(days, time); fragment.append(row); }); if (fragment.childNodes.length) $('#store-hours').replaceChildren(fragment); }
  const channels = [];
  if (phone) channels.push({ href: 'https://wa.me/' + phone, text: 'Conversar no WhatsApp', icon: 'whatsapp' });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || '')) channels.push({ href: 'mailto:' + config.email, text: config.email, icon: 'mail' });
  const instagram = safeUrl(config.instagram, ['instagram.com']);
  if (instagram) channels.push({ href: instagram, text: 'Acompanhe no Instagram', icon: 'heart' });
  if (channels.length) { const container = $('#contact-channels'); container.replaceChildren(); channels.forEach(channel => { const link = document.createElement('a'); link.href = channel.href; const icon = document.createElementNS('http://www.w3.org/2000/svg','svg'); icon.setAttribute('class','icon' + (channel.icon === 'whatsapp' ? ' whatsapp-icon' : '')); icon.setAttribute('aria-hidden','true'); const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#i-' + channel.icon); icon.append(use); const text = document.createElement('span'); text.textContent = channel.text; link.append(icon,text); if (channel.href.startsWith('https:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; } container.append(link); }); }
  if (phone) { $('#submit-button span').textContent = 'Preparar mensagem para WhatsApp'; $('#contact-mode-note').textContent = 'Você poderá revisar a mensagem antes de abrir o WhatsApp. O atendimento e os horários dependem da confirmação da equipe.'; $('#form-privacy').textContent = 'Seus dados não são armazenados neste site. Ao abrir o WhatsApp, a mensagem será compartilhada com esse serviço.'; }
  if (config.demo === false) $$('[data-demo-label]').forEach(label => { label.hidden = true; });
  if (config.searchConsoleVerification && /^[A-Za-z0-9_-]+$/.test(config.searchConsoleVerification) && !$('meta[name="google-site-verification"]')) { const meta = document.createElement('meta'); meta.name = 'google-site-verification'; meta.content = config.searchConsoleVerification; document.head.append(meta); }
  $('#year').textContent = String(new Date().getFullYear());

  const form = $('#contact-form');
  // A ação só é habilitada com JavaScript para evitar envio por GET se o script falhar.
  $('#submit-button').disabled = false;
  $('#submit-button').type = 'submit';
  function prepareInquiry(subject, message = '') { $('#subject').value = subject; if (message) $('#message').value = message; $('#message-result').hidden = true; $('#form-status').textContent = ''; navigate('#contato', '#name'); }
  $$('.inquiry').forEach(button => button.addEventListener('click', () => prepareInquiry(button.dataset.subject, 'Olá! Gostaria de saber mais sobre ' + button.dataset.subject.toLowerCase() + '.')));
  $$('.product-inquiry').forEach(button => button.addEventListener('click', () => { const pet = petType === 'cats' ? 'gatos' : 'cães'; prepareInquiry('Produtos para ' + pet, 'Olá! Gostaria de consultar opções de ' + button.dataset.category.toLowerCase() + ' para ' + pet + '.'); }));
  form.addEventListener('input', event => { if (event.target.setCustomValidity) event.target.setCustomValidity(''); if (event.target !== $('#prepared-message')) { $('#message-result').hidden = true; $('#form-status').textContent = ''; } });
  form.addEventListener('change', () => { $('#message-result').hidden = true; $('#form-status').textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#name'); const message = $('#message');
    name.setCustomValidity(name.value.trim().length >= 2 ? '' : 'Digite seu nome com pelo menos 2 caracteres.');
    message.setCustomValidity(message.value.trim().length >= 5 ? '' : 'Conte um pouco mais: escreva pelo menos 5 caracteres.');
    if (!form.reportValidity()) return;
    const pet = $('#pet-name').value.trim();
    const text = 'Olá, ' + (config.brand || 'Pata & Cia.') + '!\nMeu nome é ' + name.value.trim() + '.' + (pet ? '\nMeu pet se chama ' + pet + '.' : '') + '\nAssunto: ' + $('#subject').value + '\n\n' + message.value.trim();
    $('#prepared-message').value = text; $('#message-result').hidden = false;
    if (phone) { $('#result-title').textContent = 'Revise sua mensagem.'; $('#result-explanation').textContent = 'Abra o WhatsApp para revisar e enviar. Nenhum agendamento será confirmado automaticamente.'; $('#send-whatsapp').href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text); $('#send-whatsapp').hidden = false; }
    $('#form-status').textContent = phone ? 'Mensagem preparada. Você pode revisá-la antes de abrir o WhatsApp.' : 'Mensagem preparada. Nada foi enviado.';
    $('#prepared-message').focus({ preventScroll: true });
    scrollTo($('#message-result'));
  });
  $('#copy-message').addEventListener('click', async () => {
    const button = $('#copy-message'); button.disabled = true;
    try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText($('#prepared-message').value); $('#form-status').textContent = 'Mensagem copiada. Nada foi enviado.'; }
    catch { const message = $('#prepared-message'); message.focus(); message.select(); $('#form-status').textContent = 'Selecione e copie a mensagem com Ctrl+C, Command+C ou a opção Copiar do seu aparelho.'; }
    finally { button.disabled = false; }
  });

  const privacyDialog = $('#privacy-dialog');
  $('#privacy-button').addEventListener('click', () => { lastPrivacyFocus = document.activeElement; privacyDialog.showModal(); });
  $$('.dialog-close, .dialog-close-button').forEach(button => button.addEventListener('click', () => privacyDialog.close()));
  privacyDialog.addEventListener('click', event => { if (event.target === privacyDialog) { const rect = privacyDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) privacyDialog.close(); } });
  privacyDialog.addEventListener('close', () => { if (lastPrivacyFocus) lastPrivacyFocus.focus(); });
  renderRoute({ focus: false });
})();
