# Pata & Cia. — site de petshop

Versão 2.0 — visual moderno com cores vivas, superfícies translúcidas e animações suaves.

Projeto completo em HTML, CSS e JavaScript. Inclui apresentação inicial, logo, fotos criadas para a marca, cuidados, categorias para cães e gatos, sobre, localização, horários, perguntas frequentes e contato. Há tela de entrada com botão Entrar no petshop, navegação móvel, filtros animados em cuidados e produtos, abas com teclado, perguntas expansíveis, privacidade e preparação de mensagem.

Localização e Contato agora são telas internas próprias, com endereços `#localizacao` e `#contato`, links diretos e botões de retorno. A tela inicial usa `#inicio`; a entrada usa `#boas-vindas` ou o endereço sem fragmento. O botão Voltar do navegador funciona entre elas. Tudo permanece no mesmo HTML e funciona no arquivo único, sem regras de redirecionamento na Vercel.

O seletor Para cães / Para gatos troca a foto, os textos dos cuidados e as categorias de produtos, com transição suave. Os filtros ficam sincronizados, e a preferência de movimento reduzido desativa as animações. O ícone do WhatsApp foi substituído pelo desenho vetorial da biblioteca Bootstrap Icons.

**Esta entrega é demonstrativa.** Não há loja real, telefone, endereço, preço, estoque, avaliação, certificação ou resultado comercial inventado. O projeto está preparado para a Vercel, mas **não foi publicado em uma conta Vercel**.

## Abra agora

Abra `site-petshop.html` no Chrome, Edge, Firefox ou Safari. Esse arquivo contém as imagens, fonte, estilos e scripts, sem precisar instalar nada. O botão de copiar pode pedir que você selecione o texto manualmente em navegadores que restringem a área de transferência em arquivos locais.

Você também pode abrir `dist/index.html`, mantendo os demais arquivos de `dist` juntos.

## Publicação na Vercel

1. Extraia o ZIP.
2. Coloque **o conteúdo da pasta `pata-e-cia`** em um repositório Git de sua conta. Preserve `src`, `scripts`, `site.config.json`, `package.json`, `package-lock.json` e `vercel.json`.
3. Na Vercel, escolha criar um projeto e importe esse repositório.
4. Confira as configurações abaixo e publique.

| Campo | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `./` se os arquivos estiverem na raiz do repositório; `pata-e-cia` se essa pasta estiver dentro do repositório |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | `24.x`, fixado em `package.json` |

O arquivo `vercel.json` já define instalação, build, saída e cabeçalhos. **Não use `dist` como Root Directory:** a raiz precisa conter `package.json`; `dist` é o resultado do build. Não há dependências de npm, funções serverless ou variáveis secretas obrigatórias.

O comando de build recria `dist` do zero e copia todos os recursos necessários. Alterações devem ser feitas nos arquivos-fonte, pois editar somente `dist` faz com que a mudança seja sobrescrita no próximo build.

Também é possível usar a CLI oficial da Vercel a partir da pasta que contém `vercel.json`, autenticando-se em sua própria conta. A publicação e eventuais condições da conta são gerenciadas pela Vercel.

## Personalize os dados da loja

Edite `site.config.json` e rode `npm run build` depois.

| Campo | Como preencher |
| --- | --- |
| `brand`, `brandMain`, `brandSuffix` | Nome da marca e as duas partes do nome exibido no logo |
| `whatsapp` | DDI + DDD + número real, apenas dígitos; vazio mantém a demonstração sem destinatário |
| `email` | E-mail real da loja |
| `instagram` | URL HTTPS do perfil oficial no Instagram |
| `address`, `addressComplement` | Endereço completo e complemento confirmados |
| `mapsUrl` | Link oficial do local no Google Maps |
| `mapsEmbed` | URL do `src` obtido na opção de incorporar um mapa do Google; opcional |
| `hours` | Lista de horários: `[{ "days": "Segunda a sexta", "time": "informe o horário real" }]` |
| `siteUrl` | Domínio final completo, começando com `https://`; deixe vazio enquanto não houver domínio |
| `searchConsoleVerification` | Token real de verificação; vazio não adiciona um token fictício |
| `demo` | Mantenha `true` até revisar a marca, imagens, textos e dados comerciais |
| `indexing` | Mantenha `false` para demonstrações; mude para `true` apenas ao lançar a versão real |

Esses dados são públicos. Nunca coloque senhas, tokens privados ou chaves de API nesse arquivo.

Após configurar um número válido, o formulário prepara um link de WhatsApp com a mensagem. O visitante precisa clicar em **Abrir WhatsApp** e confirmar o envio no próprio serviço. O site não envia automaticamente, não confirma agendamento e não processa pagamentos. Sem número válido, ele somente prepara texto para copiar.

As abas de localização e horários funcionam desde já. O mapa só é incorporado se houver endereço e URL de incorporação válidos. Sem URL de incorporação, o endereço pode abrir a busca do Google Maps. Não há geolocalização do visitante.

## Edite o visual e os textos

- `src/index.html`: textos, seções, navegação e ícones.
- `src/styles.css`: cores no início do arquivo, tipografia, layout responsivo e animações.
- `src/app.js`: menu, filtros, abas, formulário e privacidade.
- `src/assets/`: fotografias otimizadas e fonte local.
- `src/favicon.svg`: símbolo da marca; ícones PNG e ICO já estão incluídos.
- `src/assets/logo.svg`: logotipo exportado para reutilização.

Ao trocar o nome da marca, atualize também a arte do logo exportado, os favicons e a imagem social em `src/assets/social.jpg`. Revise as frases de demonstração no conteúdo antes de abrir para clientes. O código não inclui depoimentos fictícios.

## Domínio, compartilhamento e SEO

O build define as URLs nesta ordem: variável `SITE_URL`, campo `siteUrl`, domínio de produção fornecido pela Vercel e URL do deploy fornecida pela Vercel. As variáveis de sistema precisam estar disponíveis no projeto. Se não estiverem, preencha `siteUrl` ou `SITE_URL` com o domínio real e publique novamente.

Em um build local sem domínio, tags que exigem uma URL absoluta são omitidas. No deploy, canonical, Open Graph, Twitter Cards, imagem social e JSON-LD recebem a origem configurada. O arquivo da imagem social já está incluído.

`robots.txt` e `sitemap.xml` são gerados a cada build. A versão demonstrativa usa `noindex,nofollow`, desabilita rastreamento e entrega um sitemap vazio. Para indexar a versão real, configure o domínio, `demo: false` e `indexing: true`. Ambientes de preview da Vercel permanecem sem indexação. O sitemap inclui apenas a página canônica pública, sem fragmentos de navegação. Isso não garante indexação nem protege conteúdo privado.

O JSON-LD usa `WebPage`, sem endereço, notas ou preços fictícios. Nenhum Google Analytics, Clarity, pixel ou rastreamento foi ativado. O aviso de privacidade descreve a implementação atual; deve ser revisto se outros serviços forem adicionados.

## Comandos locais

Com Node.js 24 instalado:

```sh
npm ci
npm run build
npm run check
npm run preview
```

O último comando apresenta o endereço local para abrir no navegador. Para recriar o arquivo único depois de editar:

```sh
npm run build
npm run standalone
```

## Verificações e limites

Consulte `VALIDACAO.md` para os resultados efetivamente obtidos. A inspeção de imagens e a verificação do build não equivalem a uma auditoria completa de acessibilidade, desempenho ou segurança. Os arquivos foram preparados para publicação, sem afirmar que já estão online.

## Fontes e licenças

As fotos e a arte de compartilhamento foram geradas para este projeto e são ilustrativas. A marca é demonstrativa e não foi submetida a pesquisa de registro. Fonte Manrope: SIL Open Font License; ícones derivados de Lucide/Feather: licenças incluídas em `licenses`. O arquivo `CREDITOS.md` registra as origens e a documentação consultada.
