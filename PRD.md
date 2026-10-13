# PRD - Jogo de Adivinhacao de Palavras

**Status:** Rascunho para validacao  
**Versao:** 0.1  
**Plataforma inicial:** Navegador  
**Publico:** Adolescentes e jovens adultos

## 1. Visao do produto

Criar um jogo casual, gratuito e sem anuncios em que a pessoa descobre uma palavra usando pistas reveladas progressivamente. O jogo deve permitir iniciar partidas sem limite, com uma dificuldade unica, sem conta e sem recursos sociais na primeira versao.

## 2. Objetivos

- Oferecer partidas simples de entender e jogar no navegador.
- Dar ao jogador ate seis tentativas para descobrir cada palavra.
- Permitir que o jogador comece outra partida ao terminar a atual.
- Manter um historico local e evitar apresentar novamente palavras ja jogadas naquele navegador, enquanto houver palavras disponiveis.

## 3. Publico e contexto de uso

O publico principal sao adolescentes e jovens adultos que procuram uma atividade casual e individual. A primeira versao sera acessada pelo navegador. A interface deve se adaptar a telas menores e maiores.

## 4. Escopo do MVP

### Incluido

- Partidas individuais ilimitadas.
- Palavras-alvo em portugues ou ingles, com pelo menos seis letras.
- Uma unica dificuldade.
- Pistas apresentadas progressivamente.
- Ate seis palpites por partida.
- Aceitar palpites sem acento quando corresponderem a palavra-alvo acentuada.
- Exibir a definicao da palavra ao concluir a partida.
- Botao para iniciar outra partida.
- Historico salvo somente no navegador, sem conta ou sincronizacao.
- Evitar repeticao de palavras ja jogadas no mesmo navegador, ate esgotar o banco disponivel.
- Produto gratuito e sem anuncios.

### Fora do escopo

- Anuncios, compras ou assinaturas.
- Compartilhamento de resultados, rankings ou competicao entre jogadores.
- Conta de usuario e sincronizacao entre dispositivos.
- Varios niveis de dificuldade.
- Metas de metricas de negocio nesta etapa.

## 5. Regras do jogo

1. Uma nova partida escolhe uma palavra-alvo disponivel e mostra a primeira pista.
2. A palavra tem no minimo seis letras e nao e uma forma verbal conjugada.
3. O jogador envia um palpite por vez, com no maximo seis palpites na partida.
4. As pistas sao reveladas aos poucos. A regra exata de quando revelar cada pista ainda precisa ser confirmada.
5. Ao acertar ou ao atingir o limite de tentativas, a partida termina e mostra a palavra-alvo e sua definicao.
6. A pessoa pode iniciar outra partida pelo botao de nova partida.
7. O jogo nao deve repetir palavras ja registradas no historico local enquanto houver palavras ineditas no banco.

## 6. Requisitos funcionais

### RF-01 - Iniciar partida
O sistema deve iniciar uma partida com uma palavra-alvo elegivel, sua definicao e a primeira pista. A resposta deve permanecer oculta ate o fim da partida.

### RF-02 - Registrar palpite
O sistema deve permitir que o jogador envie palpites e informar se o palpite e valido. O tratamento de palpites fora do dicionario precisa ser definido antes da implementacao final.

### RF-03 - Normalizar acentos
Na comparacao da resposta, o sistema deve considerar equivalentes a forma acentuada e a forma sem acento, sem alterar a palavra exibida ao final.

### RF-04 - Controlar tentativas
O sistema deve permitir no maximo seis palpites por partida e encerrar a partida quando o limite for atingido sem acerto.

### RF-05 - Revelar pistas
O sistema deve apresentar pistas progressivamente. O gatilho e a quantidade de pistas por partida permanecem em aberto.

### RF-06 - Encerrar e mostrar definicao
Ao acertar ou esgotar as tentativas, o sistema deve revelar a palavra-alvo e mostrar sua definicao. A partida encerrada nao deve aceitar novos palpites.

### RF-07 - Jogar novamente
Depois do encerramento, o jogador deve poder iniciar outra partida por meio de um botao.

### RF-08 - Manter historico local
O sistema deve guardar no navegador os dados das partidas concluidas: palavra, idioma, pistas apresentadas, palpites, resultado, numero de tentativas e data. Esses dados nao devem ser sincronizados com uma conta ou enviados para um servico remoto nesta versao.

### RF-09 - Evitar repeticoes
O sistema deve consultar o historico local ao selecionar uma palavra e priorizar palavras ainda nao jogadas. O comportamento quando todas as palavras disponiveis ja tiverem sido usadas precisa ser definido.

### RF-10 - Suportar portugues e ingles
O conteudo deve incluir palavras e definicoes em portugues e ingles. Ainda falta definir se o jogador escolhe o idioma ou se partidas dos dois idiomas podem ser sorteadas na mesma sequencia.

## 7. Requisitos de qualidade

- A aplicacao deve funcionar em navegadores modernos e adaptar-se a telas de celular e desktop.
- O jogo deve ser compreensivel sem cadastro e sem instrucoes extensas.
- O historico deve persistir no mesmo navegador entre sessoes. Limpar os dados do navegador pode apagar esse historico.
- Texto e controles devem permanecer legiveis e utilizaveis em diferentes tamanhos de tela.
- Como nao ha conta, o historico local nao acompanha o jogador em outro navegador ou dispositivo.

## 8. Conteudo e curadoria

Cada entrada do banco de palavras deve conter, no minimo:

- Palavra-alvo e idioma.
- Definicao.
- Uma ou mais pistas ordenadas.
- Indicacao de elegibilidade para o jogo.

As respostas nao devem ser formas verbais conjugadas. A fonte do vocabulario e das definicoes, os criterios para regionalismos e palavras raras, e o tratamento de palavras repetidas entre idiomas precisam ser definidos. O tamanho finito do banco limita a capacidade de evitar repeticoes indefinidamente.

## 9. Criterios de aceite do MVP

- Uma partida apresenta uma palavra oculta de pelo menos seis letras e uma pista inicial.
- O jogador nao consegue enviar mais de seis palpites na mesma partida.
- Uma resposta correta encerra a partida e revela palavra e definicao.
- A sexta tentativa incorreta encerra a partida e revela palavra e definicao.
- O jogador consegue iniciar outra partida pelo botao exibido ao fim da rodada.
- Um palpite sem acento pode corresponder a uma resposta acentuada.
- Partidas concluidas aparecem no historico do mesmo navegador depois de recarregar a pagina.
- A selecao evita palavras presentes no historico, enquanto existirem palavras ineditas.
- A experiencia pode ser usada em telas pequenas e grandes sem perda dos controles principais.

## 10. Decisoes pendentes

1. As pistas avancam automaticamente depois de cada palpite incorreto, ou o jogador pode solicitar a proxima pista?
2. O idioma e escolhido antes da partida ou sorteado entre portugues e ingles?
3. Como validar palpites que nao estejam no vocabulario aceito?
4. O que acontece quando todas as palavras disponiveis ja apareceram: permitir repeticoes, bloquear novas partidas ou adicionar conteudo?
5. Quais variantes de portugues e ingles sao aceitas, e como lidar com plurais, infinitivos, nomes proprios e palavras regionais?
6. Qual sera a fonte/licenca do vocabulario e das definicoes?

## 11. Riscos e dependencias

- **Banco de palavras:** evitar repeticoes depende da quantidade e qualidade do conteudo disponivel. Partidas ilimitadas nao significam palavras ineditas para sempre.
- **Duas linguas:** as pistas e definicoes precisam estar corretas no idioma da palavra e ser adequadas ao publico.
- **Historico no navegador:** dados locais podem ser removidos pelo usuario ou pelo navegador e nao sao compartilhados entre dispositivos.
- **Regra de pistas:** o ritmo de revelacao afeta a dificuldade e precisa ser validado antes de fechar o fluxo da partida.
