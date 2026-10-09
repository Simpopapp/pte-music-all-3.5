# PRD — project5: Estruturas Musicais Suno V5 para os Grupos do Tipo B

> Derivado de `.opencode/project5.md` (planejamento) e `.opencode/prompt-replicar-artista.md`
> (metodologia de referência). Reaproveita o processo validado do project4.
> Precedência de escopo: planejamento > PRD > roadmap. Precedência de "como": PRD manda.

---

## 1. Contexto

O app WFD Groups exibe as 301 frases Write From Dictation do PTE Academic em 3 versões
de separação (A: 10/10 → 31 grupos; B: 20/20 → 16 grupos; C: 30/30 → 11 grupos).

O project4 entregou, para o tipo C:

- 11 estruturas musicais completas (2 txt por grupo) em `data/songs/tipo-c/`.
- Script de validação `data/validate_songs_tipo_c.py` (fidelidade + limites).
- Módulo `src/data/wfd-songs-c.ts` gerado e botões "Copiar letra" / "Copiar ritmos"
  apenas nos grupos do tipo C.
- Guia metodológico `docs/planning/suno-v5-methodology.md` (Suno V5 / Imagine Dragons).

O project5 replica o mesmo processo para o **tipo B**, conforme o planejamento:
criar estruturas musicais completas individualmente para cada grupo do tipo B, com
geração paralela por subagentes e integração no app com botões de cópia.

## 2. Problema

Os grupos do tipo B hoje são texto cru. Para produzir músicas no Suno V5 a partir
deles, cada grupo precisa de um artefato autoral:

1. **TXT 1 — Letra completa** (campo de letra do Suno): música estruturada (seções,
   marcações e instruções de performance embutidas em inglês), com ≥ ~2000 chars no
   total (≈1000 líricos + ≈1000 de instruções embutidas).
2. **TXT 2 — Elementos de estilo** (campo Style do Suno): ≤ 200 caracteres, inglês,
   sequencial separado por vírgulas, descrevendo como a música deve ser cantada/produzida.

## 3. Decisão de escopo (registrada)

- O planejamento diz "~20 estruturas musicais", porém o tipo B tem **16 grupos** (301
  frases: 15 grupos de 20 + 1 grupo de 1). A leitura coerente com "individualmente pra
  cada um dos grupos do tipo B" é: **uma estrutura musical completa por grupo do tipo
  B → 16 estruturas (32 arquivos txt)**. O "~20" do planejamento é aproximação do
  tamanho dos grupos (20 em 20).
- **Decisão (D1):** gerar 16 estruturas, 1 por grupo. Registrada no roadmap
  (justificativa) e aqui. Reexecutável via pipeline se o usuário pedir diferente.
- O grupo 16 (1 frase) segue o mesmo tratamento do grupo 11 do tipo C no project4:
  duplicação física permitida pelo guia metodológico (§1: "duplique fisicamente a
  linha"), sem reescrita.

## 4. Metodologia (herdada e adaptada)

Fontes: `.opencode/prompt-replicar-artista.md` + `docs/planning/suno-v5-methodology.md`
(guia do project4, dataset-agnóstico). Síntese operacional por estrutura:

1. **Base lírica intocável (OBSERVAÇÃO CONTRADITÓRIA — prioridade máxima):** as 20
   frases de cada grupo aparecem **exatamente iguais** ao dataset. Nenhuma palavra
   muda, é cortada ou adicionada. O trabalho é planejar a **estrutura** (seções,
   cadência, voz, instruções rítmicas) para que o texto funcione no Suno V5.
2. **Instruções de performance em inglês** embutidas no campo de letra (marcações de
   seção, vocal, BPM, dinâmica, timbre), independentemente do idioma da letra.
3. **Elementos de estilo em inglês** (≤ 200 chars), pensados em inglês, específicos
   para o caso — sem copiar exemplos do prompt e **sem nome de artista** (Suno bloqueia).
4. **Estágios de produção por estrutura:**
   (a) análise das frases (tema, repetições, métrica, humor, hook);
   (b) plano de arranjo (arco dramático quiet→loud, BPM, seções Suno V5);
   (c) redação da letra estruturada com anotações;
   (d) revisão de fidelidade palavra a palavra;
   (e) campo de estilo;
   (f) checagem de limites (letra ≥ ~2000 chars; estilo ≤ 200 chars).

**Adaptação em relação ao tipo C:** grupos de 20 frases (vs 30) → arranjo mais enxuto;
seções com 3–4 frases, no máximo 1–2 duplicações planejadas por grupo. A diferença
estrutural é de densidade, não de método. O guia `suno-v5-methodology.md` permanece
fonte de verdade; nenhuma regra muda.

## 5. Formato dos artefatos

Para cada grupo N do tipo B (N = 1..16), pasta `data/songs/tipo-b/grupo-{NN}/`:

- `letra.txt` — letra completa com marcações Suno V5 (≥ ~2000 chars no total, sendo
  ~1000 líricos + ~1000 de instruções embutidas; instruções em inglês).
- `estilo.txt` — ≤ 200 chars, inglês, elementos separados por vírgula.

`data/songs/tipo-b/` é a **fonte da verdade**; o módulo TS é gerado a partir dela.

Espelho para o app: `src/data/wfd-songs-b.ts` (strings embutidas, geradas a partir dos
txt por `data/generate_songs_module_b.py`, com metadados por grupo). Mesmo padrão do
`wfd-songs-c.ts` (interface `WfdSong`, campo `group`, `letra`, `estilo`).

## 6. Integração no app

- Nos grupos do **tipo B**, além dos botões atuais (texto, JSON, JSON completo), dois
  botões novos: **"Copiar letra"** (conteúdo de `letra.txt`) e **"Copiar ritmos"**
  (conteúdo de `estilo.txt`), com feedback visual de cópia.
- Tipos A e C permanecem inalterados (A nunca teve botões; C já tem os seus).
- Botões desabilitados com feedback claro caso o artefato do grupo não exista.
- Atualizar o `head()` da rota e o rodapé para refletir a nova cobertura (tipos B e C).

## 7. Estratégia de execução

- Geração em **paralelo por subagentes** (um agente por grupo, lotes simultâneos),
  cada um passando por todos os estágios de produção da seção 4, com o guia
  metodológico como insumo comum e as 20 frases exatas do grupo como base lírica.
- Contrato de saída do subagente (mesmo do project4): blocos
  `===LETRA GRUPO NN===`, `===ESTILO GRUPO NN===`, `===CHECKLIST===`.
- Grupos com falha são reexecutados isoladamente.
- **Monitor OpenCode (obrigatório no remix):** avaliar fases concluídas e escrever
  relatórios em `docs/planning/reports/`. **Proibido** usar o monitor para gerar as
  estruturas (determinação do planejamento).

## 8. Escopo por fase

1. **Fundação do protocolo** — PRD + roadmap + coerência + monitor informado.
2. **Metodologia** — verificar/ajustar o guia existente para o tipo B (contrato de
   saída e limites por grupo de 20 frases); nenhuma pesquisa nova necessária (guia
   do project4 cobre Suno V5 / Imagine Dragons e foi validado com fontes 2026).
3. **Geração paralela** — 16 estruturas (32 txt) por subagentes simultâneos.
4. **Validação de artefatos** — script `data/validate_songs_tipo_b.py` (limites de
   caracteres, instruções em inglês, fidelidade palavra a palavra das frases por grupo).
5. **Integração no app** — gerador do módulo TS + módulo gerado + botões de cópia no
   tipo B + head()/rodapé atualizados.
6. **Validação final e reporte** — build, testes, Playwright, status por stage e
   notificação ao monitor; entrega final ao usuário.

## 9. Critérios de aceite

- [ ] 16 pastas em `data/songs/tipo-b/`, cada uma com `letra.txt` e `estilo.txt`.
- [ ] Cada `letra.txt` contém as frases do grupo **idênticas** ao dataset
      (validação automática palavra a palavra; grupo 16 com duplicação física).
- [ ] Cada `letra.txt` ≥ ~2000 chars (≈1000 líricos + ≈1000 instruções, instruções em inglês).
- [ ] Cada `estilo.txt` ≤ 200 chars, em inglês, elementos separados por vírgula.
- [ ] Tipo B no app exibe "Copiar letra" e "Copiar ritmos" por grupo, com feedback visual.
- [ ] Tipos A e C inalterados.
- [ ] `bunx vitest run` verde; `bun run build` sem erros; verificação Playwright da UI.
- [ ] Monitor informado por fase concluída, com relatórios em `docs/planning/reports/`.

## 10. Riscos e mitigações

- **Divergência entre subagentes** → guia metodológico único + validação automática.
- **Alteração acidental das frases** → script de fidelidade palavra a palavra (Fase 4).
- **Estilo > 200 chars** → checagem automática e reescrita pelo agente responsável.
- **Letra < ~2000 chars** → checagem automática e reescrita (grupos de 20 frases têm
  menos matéria: duplicação física de linhas e instruções mais densas).
- **Grupo 16 (1 frase)** → duplicação física (precedente do grupo 11 do tipo C).
- **Volume de geração** → lotes paralelos; falhas individuais são reexecutadas isoladamente.

## 11. Registros de decisão

- D1: 16 estruturas (1 por grupo do tipo B), e não ~20 — ver seção 3.
- D2: fonte da verdade dos txt em `data/songs/tipo-b/`; app consome módulo TS gerado.
- D3: instruções Suno sempre em inglês; frases do dataset jamais alteradas.
- D4: grupo 16 (1 frase) estruturado via duplicação física, precedentes do project4.

## 12. Apêndice — Inventário dos grupos do tipo B

Fonte: `data/wfd-groups-b.json` (ordem = ordem do dataset por id crescente).
Cada subagente recebe o número do grupo e lê as frases direto do JSON; o inventário
abaixo é a referência de conferência (contagens por grupo).

## 13. Inventário por grupo (frases na ordem do dataset)

### Grupo 1 (20 frases)
- Make sure you wash your hands before preparing food.
- Online courses allow students to work at their own pace.
- We can have a lecture on the morning of Thursday.
- Understanding visual media has never been more challenging.
- Many university lectures can now be viewed on the internet.
- Your statistical information depends on your raw data.
- The coffee machine on the third floor is not working today.
- You need to hand in the essay next semester.
- The manager will have a meeting in this room today.
- The conference will be held on Thursday morning.
- Canada has a long history of immigration from many different parts of the world.
- Your boss wants you to finish this report by Monday.
- Chemical reactions occur when substances combine or change.
- Please make an appointment to see the manager.
- You can get coffee and tea in the lunchroom.
- You will get coffee and tea in the next room.
- Computers used to be larger than they are now.
- Social psychology is concerned with the understanding of human behaviors.
- You must call your doctor to make an appointment.
- We are encouraged to write on each page.

### Grupo 2 (20 frases)
- Tact is the knack of making a point without making an enemy.
- Her design incorporates the best aspects of modern architecture.
- Honey can be used as food and as a health product.
- Art and design are competitive fields to work in.
- Universities need to secure grants for research subjects.
- All experimental procedures are outlined in the laboratory manual.
- There is a lot of debate about that topic.
- The farmers need to adapt to the changes in the climate.
- How important is packaging in the market for buyers?
- Please keep the key with you because the front door often locks automatically.
- Photography can be really useful in geographical research.
- Coursework gives students the chance to thoroughly explore the subject.
- A university degree is a requirement to enter many professions.
- Mathematics provides a foundation for understanding and analyzing data.
- Football is played throughout all years at the university.
- We are looking for new ways to engage learners.
- To get to the restroom go into the hall and turn right.
- Extension requests for the assignment must be submitted before the deadline.
- Show your passport and boarding pass at the gate.
- The students are supposed to assemble in the seminar hall before the announcement.

### Grupo 3 (20 frases)
- The marine environment has been destroyed by pollution and unsustainable development.
- Designers need to keep up with social trends.
- A new collection of articles has just been published.
- You can use your laptops in the lecture.
- People look at organizational failure in different ways in studies.
- When the roots of a plant fail foliage suffers.
- The course involves a combination of pure and applied mathematics.
- A mixture is defined as a compound of chemically separate parts.
- Political power only disappears when this stage has been completed.
- The new law was harder to impose than the government thought.
- The marketing budget is doubled since the beginning of the year.
- The business parliament seminar includes an internship with a local firm.
- Our medical school students must attend the talk about optional courses.
- The article considered leisure habits of teenagers in rural areas or places.
- It is really a comprehensive program that covers both theory and practice.
- The nation achieved prosperity by opening its exports for trade.
- Optional tutorials are offered in the final week of the term.
- Traffic is the main cause of pollution in main cities.
- He has landed the job in a prestigious law firm.
- I dont think its possible to solve the problem easily.

### Grupo 4 (20 frases)
- The business plan seminar includes an internship with a local firm.
- You can use your laptop during the lecture.
- We cannot consider an increase in price at this stage.
- Organizational failure is considered the large range of specific areas in academic literature.
- The curriculum needs to be adjusted for development.
- Students representatives will visit classes with voting forms.
- The vocabulary that has peculiar meanings is called jargon.
- All industries consist of the systems as inputs processes outputs and feedback.
- The summer school programs allow students to summarize their studies.
- We encourage students to submit their applications before the deadline.
- You will acquire many skills during the academic studies.
- His analysis appeared to be based on the fourth premise.
- Please note that the seminar has now been canceled.
- The cooperator operates a continuous assessment.
- The article considered the leisure habits of teenagers in rural areas.
- Students should have awareness of how the business develops globally.
- Studies showed there is a positive correlation between the two variables.
- The director of the gallery was grateful for the anonymous donation.
- The other book isnt thorough but its more insightful.
- The results of the study underscored the discoveries from early detections.

### Grupo 5 (20 frases)
- The earths atmosphere is primarily composed of oxygen and nitrogen gases.
- The rising temperature is changing the wildlife population.
- Education and training provide important skills for the labor force.
- Novelists write things that they know about.
- The college operates a system of continuous assessment.
- To gain access to the facilities student cards must be shown.
- The digital camera has some advantages over traditional film.
- Graduates from this course generally find jobs in the insurance industry.
- Much of this research is carried out in the laboratory.
- At university students can make friends for life.
- The study center in the library has all the latest technology.
- In my opinion the car should be repaired soon.
- There is a lot of traffic in the morning.
- A world renowned expert on economics and marketing will give a lecture.
- The weather used to be lovely at this time of the year.
- The classical mechanism is considered a branch of mathematics.
- A good architectural structure should be usable durable and beautiful.
- Calculators are not allowed during the examination.
- A pie chart provides a useful means of data comparison.
- Before preparing food please make sure to wash your hands.

### Grupo 6 (20 frases)
- Air pollution is a serious problem all over the world.
- Please move us to the meeting room for the next hour.
- The students will meet their new teachers after the summer vacation.
- You can keep your bags in the backroom.
- The food crops require a large quantity of water and fertilizer.
- Remember the prestigious election of student membership has strict eligibility criteria.
- Human beings compete with other species for resources and space.
- Communication skills have become more important in recent years.
- Food containing overabundant calories supplies little or no nutritional value.
- New media journalism is an interesting field of study.
- New media is to find new areas to study.
- The employment demand in engineering is increasing rapidly.
- We have a lecture in the morning on Thursday.
- The use of mobile phone is not permitted in the library.
- Many diseases on the list have been eradicated.
- Academic libraries across the world are steadily incorporating social media.
- The rising sea temperature is a sign of climate change.
- An effective business manager is always open to new ideas.
- All of the assignments should be submitted in person to the faculty office.
- All the educational reforms have been inadequately implemented.

### Grupo 7 (20 frases)
- An archaeologists new discovery stands out in previously overlooked foundations.
- His appointment with the Minister of Culture seems like a demotion.
- Employment figures are expected to be improved in the next few years.
- Despite their differences all forms of life share the same characteristics.
- The economic status of the early Roman Republic will be examined.
- Educational level is found to be related to social and economic backgrounds.
- He landed a job in a prestigious law firm.
- I thought it was thrown in a small meeting room.
- If finance is a cause of concern scholarships may be available.
- It is being made to reduce harmful emissions.
- Medical researchers have focused on different treatments and diseases.
- Most scientists believe that climate change threatens lives on earth.
- The Chemistry building is located near the entrance to the campus.
- Our professor is hosting the business development conference.
- The organization plays an important role in academic literature.
- Organizational failure is considered in various perspectives in academic literature.
- Plants are the living things that can grow inland or in water.
- Radio is a popular form of entertainment throughout the world.
- Scientific beneficiary to space exploration is frequently questioned.
- Some people regarded it as care while others regarded it as recklessness.

### Grupo 8 (20 frases)
- Students have the option to live in college residences or apartments.
- The archaeologists new discoveries stand out in previously overlooked foundations.
- The business policy seminar includes an internship with a local firm.
- The commissioner will portion the funds among all the sovereignties.
- The dance department stages elaborated performances each semester.
- Sugar is a compound that consists of carbon oxygen and hydrogen.
- The massive accumulation of data was converted to a communicable argument.
- The most popular courses still have a few places left.
- The museum is closed on Thursday morning every month.
- New media has transcended traditional national boundaries.
- The new paper challenged many previously accepted theories.
- New materials and techniques are changing the way of architecture.
- There is clearly a need for further research in this field.
- There was a prize for the best student in the presentation.
- Traffic is the main cause of air pollution in many cities.
- We are able to work in a team.
- We can work together to achieve higher educational standards.
- We cant consider any increase in our price at this stage.
- Distance learning allows you to develop a career around your commitments.
- One of the election promises is to decrease the income tax.

### Grupo 9 (20 frases)
- Dealing with the growing population is a challenge for many governments.
- Those who are considering a career in marketing should attend the talk.
- The visiting guest used to be the lecturer of this department.
- Farming methods around the world have greatly developed recently.
- Mature students usually adapt to university life extremely well.
- The industrial revolution in Europe was driven by steam technology.
- Our courses help improve critical thinking and independent learning skills.
- They developed a unique approach to training their employees.
- Without a doubt this theory has a number of limitations.
- You need to put these books on the table over there.
- Muscle cells bring parts of the body closer together.
- Banks charge interest on the money they lend to customers.
- The student shop has a range of stationery.
- We hold the visiting hours throughout the year for students.
- A strong liner is used to measure distance and baseline.
- The library will be closed for staff training tomorrow morning.
- Scientists recognized the different ice types according to the water molecule content.
- Social media is criticized for causing internet addiction.
- Essays and assignments are spread out across the academic year.
- The area has a number of underwater habitats in species.

### Grupo 10 (20 frases)
- The momentum is defined as the combination of mass and velocity.
- The researchers are disappointed that their materials are proved to be inconclusive.
- Requests for late submissions will not be accepted under any circumstances.
- Students should leave their bags on the table by the door.
- Slides and handouts can be downloaded after the lecture.
- Sugar is a compound including carbon hydrogen and oxygen items.
- The north campus car park could be closed on Sunday.
- Firm conclusions can be established through rigorous experiments.
- All medical students must clean their hands before entering the room.
- Your ideas are discussed depending on your seminar or tutorial.
- The bus for London will leave 10 minutes later than planned.
- The printers automatically print both sides of each page.
- There is a wide perception that engineering is for boys.
- Archaeologists discovered tools and other artifacts near the tombs.
- The professor took a year off to work on her book.
- The Science Library is currently located on the ground of the library.
- Take the first step to apply for your university scholarship.
- Check the website if you are looking for discount textbooks.
- The unemployment rate has fallen to its lowest level in years.
- People provide the reports to support your idea in these arguments.

### Grupo 11 (20 frases)
- The shipwreck of this year ruined some artifacts which were interested in historians.
- Gravity is the force that attracts two bodies from one another.
- Criminal charges will be brought against all of the men.
- Plants are able to continue growing throughout their lives.
- Castles were designed to intimidate both local people and the enemies.
- A celebrated theory is still the source of great controversy.
- A good academic paper should be clear.
- All industries consist of systems of inputs, processes, outputs and feedback.
- Although sustainable development is not easy, it is an unavoidable responsibility.
- Are these real PTE exam questions?
- Artists, other than politicians, played their own roles as critics of the culture.
- Babies can distinguish between what is language and what is not.
- Businesses must adapt to the data protection regulations.
- Companies' projects must adapt to the general data protection regulations.
- Convincing evidence to support this theory is hard to obtain.
- Economic problems caused a big rise in unemployment.
- Exotic activities can help students develop more talents.
- Experts say learning and listening to music can reduce the stress.
- Extracurricular activities can help students to develop more talents.
- Foods containing overabundant calories supply little or no nutritional value.

### Grupo 12 (20 frases)
- Globalization has been an overwhelming urbanization phenomenon.
- Having strong motivation is vital for achieving your goal.
- He wrote poetry and plays as well as scientific papers.
- How often is this page updated?
- How should I practise Write From Dictation?
- Humans use symbolic languages to communicate plans and contentions.
- I will now demonstrate how the reaction can be arrested by adding a dilute acid.
- Industries now bring more job opportunities than agriculture and fishing combined.
- It helps you to rationally assess your arguments.
- It is interesting to observe the development of language skills of toddlers.
- Lots of people turned out to be at the presidential address.
- Many birds migrated to the warmer area for winter.
- Many important policies need to be made.
- Please click on the logo above to enter the site.
- Providers of higher education treat plagiarism extremely seriously.
- Psychologists say what we have experienced influences our behaviors.
- Rising inflation may indicate the increasing demand for consumer products.
- Scientific experiments should be repeated in order to verify the results.
- Scientists found most of the studies today.
- She began by giving an outline of the previous lecture.

### Grupo 13 (20 frases)
- Strangely, people are impacted by spontaneously using statistics.
- Students are advised to use multiple methods for this project.
- Students are permitted to park in campus parking spaces.
- Students are recommended to read new books by professor Johns.
- Students may only use parking cards in authorized university parking space.
- Students would develop confidence in their ability to think critically.
- Sugar is a compound including carbon, hydrogen, and oxygen atoms.
- Technology is no longer a simple tool that we can control.
- That means they have so many struggling overlaps.
- The British students need to study mathematics in secondary school.
- The closing date for applications for travel scholarships is next Monday.
- The course covers architecture planning and construction on the international scale.
- The course will start with the history of architecture.
- The disease that was serious has now been eradicated.
- The essay will argue that technology does more harm than good.
- The exam system has been upgraded due to professional exams.
- The extent of advertising on children is very much open to debate.
- The faculty staff are very approachable, helpful and extremely friendly.
- The falling birth rate means the number of students drops.
- The garden behind the university is open to the public in summer.

### Grupo 14 (20 frases)
- The goal of the company is to get investment.
- The government is funding research studies on the consequences of unemployment.
- The history of this university is a long and interesting one.
- The island is located at the south end of the bay .
- The meeting has some struggling overlaps.
- The new media has transformed the traditional, national boundaries.
- The opening hours of the library are reduced during summer.
- The output should be proportional to the input.
- The plight of wildlife has been ignored by many developers.
- The posters are on display at the larger lecture theatre.
- The reception staff can give information of renting and printing.
- The scholarship is available for both local and international students.
- The scientific beneficiary of space exploration is frequently questioned.
- The skills of great stage actors cannot be taught.
- The stock market redesigned the market throughout the world.
- The teaching staff are actively engaged in the original research.
- The timetable for the new term will be available next week.
- The topic of next week colloquium will be nuclear disarmament.
- The toughest part of research for undergraduate education is funding.
- The two sides have disagreed on how to solve the problem.

### Grupo 15 (20 frases)
- The university library holds a number of collections of geological maps.
- The untapped potential for using the sun's rays is phenomenal.
- There are many different styles of business management.
- There is a clear need for further research in this field.
- This course aims to develop your knowledge of statistics.
- This course is integrated because it has several parts.
- This course puts great emphasis on critical thinking skills.
- Those who are considering a career of marketing should attend the talk.
- Thousands of people turned out to be at the presidential address.
- Too much information may be avoided by good research design.
- Undergraduates have a wide range of cultural modules to choose from.
- Understanding how to use the library will save your time.
- We are able to accommodate more students than previously.
- We can all meet in the office after the lecture.
- We have a lecture on the morning of Thursday.
- We help students to develop their individuals and follow their interests.
- We support the research on problems related to tropical cyclone dynamics and forecasting.
- When sentencing, the court will depend on whether the criminal is guilty or not.
- Writing an essay is easy once the research is finished.
- You need to collect a clear note while learning new languages.

### Grupo 16 (1 frases)
- Your ideas are sophisticated in seminars and tutorials.

## 14. Referências cruzadas e precedentes

- **Precedente direto:** project4 (tipo C) — mesma arquitetura de artefatos, validação
  e integração. Relatórios do monitor em `docs/planning/reports/stage-0[1-6]-eval-project4.md`.
- **Guia metodológico:** `docs/planning/suno-v5-methodology.md` — regra suprema (frases
  intocáveis), formato Suno V5 verificado em 2026, DNA "Imagine Dragons" sem nome de
  artista, estágios de produção e contrato de saída dos subagentes (§4).
- **Validação de referência:** `data/validate_songs_tipo_c.py` — modelo a replicar em
  `data/validate_songs_tipo_b.py` com as contagens do tipo B (16 grupos: 15×20 + 1×1).
- **Geração do módulo TS:** `data/generate_songs_module.py` — modelo a replicar em
  `data/generate_songs_module_b.py` (fonte `data/songs/tipo-b/`, saída `src/data/wfd-songs-b.ts`).
- **Testes existentes:** `src/test/wfd-songs-c.test.ts` — modelo a replicar em
  `src/test/wfd-songs-b.test.ts` (integridade dos artefatos no módulo TS).

## 15. Contrato de saída dos subagentes (tipo B)

Cada subagente recebe: número do grupo (1–16), caminho do dataset
(`data/wfd-groups-b.json`) e o guia metodológico. Entrega na mensagem final, exatamente
nestes blocos:

```
===LETRA GRUPO NN===
(conteúdo integral do letra.txt)
===ESTILO GRUPO NN===
(conteúdo integral do estilo.txt)
===CHECKLIST===
frases: 20/20 íntegras | letra: N chars | estilo: N chars | bpm: NN | hook: "<frase>"
```

Grupo 16: `frases: 1/1 íntegra (duplicação física)`. Sem resumos parciais dentro dos
blocos; o conteúdo dos blocos é o artefato final.
