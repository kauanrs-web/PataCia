# Verificações da entrega

Data: 3 de outubro de 2026.

| Verificação | Resultado |
| --- | --- |
| Instalação limpa com `npm ci` | Concluída; projeto sem dependências externas de npm |
| Build com Node.js 24 | Concluído; `dist` recriado do zero |
| Referências a imagens, fonte, CSS, JS e favicons | 15 referências locais verificadas; arquivos presentes e não vazios |
| JavaScript do site | Sintaxe validada pelo Node |
| JavaScript do arquivo HTML único | Sintaxe validada depois da incorporação dos scripts |
| IDs e âncoras da página | Sem IDs duplicados ou âncoras internas inexistentes |
| Rótulos dos formulários e associação das abas | Conferidos no HTML |
| Imagens | Arquivos PNG, WebP, JPG e ICO decodificados sem erro; fotos principais inspecionadas |
| JSON-LD | JSON válido, sem dados comerciais inventados |
| Configuração Vercel | Diretório `dist`, comandos de instalação e build conferidos com a documentação oficial |
| Cenário de produção | Testado em cópia isolada com domínio reservado de teste; URLs absolutas e sitemap corretos |
| Cenário de preview | Testado em cópia isolada; indexação e sitemap desabilitados |
| Versão demonstrativa final | `noindex,nofollow`, `robots.txt` restritivo e sitemap vazio |
| Arquivo HTML único | Fonte, imagens, CSS e scripts incorporados; sem dependências locais ausentes |

## Limites da verificação

- Não foi realizada inspeção visual em navegador de desktop ou celular: o recurso de controle de navegador exigido pelo ambiente não estava disponível. O layout foi implementado com breakpoints responsivos e revisado no código, mas não houve medição de overflow, teste de teclado em navegador, teste real de toque, nem captura da página renderizada.
- Na atualização 2.0, foi executado um teste de DOM, sem renderização de navegador, para entrada, quatro telas, links internos, histórico, menu, abas, filtros sincronizados, solicitação de animações, preferência de movimento reduzido e preparação do formulário. Todos os cenários passaram. Esse teste não mede a aparência, duração percebida ou fluidez real das animações.
- Não houve auditoria Lighthouse, medição de Core Web Vitals ou auditoria completa de WCAG.
- Nenhuma mensagem foi enviada. WhatsApp, e-mail, Instagram e mapa dependem de dados reais da loja.
- O projeto não foi publicado na Vercel. A compatibilidade do pacote e o build local foram verificados; a implantação na conta do usuário ainda é necessária.

O npm mostrou um aviso sobre uma configuração de proxy do ambiente de execução. A instalação e os comandos finalizaram com sucesso; a configuração de proxy não faz parte do projeto entregue.

## Atualização 2.0

Build, recursos locais e sintaxe do HTML único novamente verificados após as mudanças. Cada tela tem seu título principal. O código-fonte e o arquivo único mantêm suporte à navegação por fragmentos; não foi criada dependência de servidor para as telas.

## Limpeza dos selos decorativos

Removidos os quatro selos da entrada/apresentação: “Um novo jeito de sentir o cuidado”, “O seu pet merece”, “Bem-vindo à família” e “Seu universo pet”. A imagem, a entrada e a navegação permanecem funcionais. Build e arquivo único regenerados; recursos e sintaxe novamente conferidos.
