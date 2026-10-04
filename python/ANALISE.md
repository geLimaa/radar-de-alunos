# Análise dos clusters

## 1. Perfis plantados

Cada aluno recebe um perfil sorteado e o perfil não aparece no `students.csv`, os valores variam dentro de cada perfil usando distribuições Exponencial, Poisson, Binomial e Normal.

| Perfil | % da base | Colunas afetadas e como |
|---|---:|---|
| Pf1_Engaged | 26,3% | Poucos dias sem atividade, muitas aulas, simulados e redações, alta presença em mentorias e acertos elevados. |
| Pf2_Inactive | 18,7% | Maior chance de nunca ter atividade, muitos dias sem atividade, poucas aulas, simulados e redações, mais faltas e menor desempenho. |
| Pf3_Academic | 24,6% | Muitas aulas, simulados e redações, alto desempenho nas áreas e boa participação em mentorias. |
| Pf4_Mentorship | 15,3% | Muitas aulas e mentorias, alta presença e avaliação, desempenho acadêmico intermediário. |
| Pf5_Sporadic | 15,1% | Atividade irregular, mais dias sem atividade, poucas aulas, simulados e redações e desempenho intermediário. |

## 2. Features, nulos e escala

As variáveis categóricas ficaram fora do KMeans, pois não possuem uma ordem numérica natural, foram utilizadas sete features numéricas:

| Feature | Por quê | Nulo vira |
|---|---|---|
| `daysSinceLastActivity` | Mede a recência da atividade do aluno. | `tenureDays`, indicando que o aluno nunca teve atividade. |
| `lessonsLast30d` | Mede a atividade recente em aulas. | Não possui nulos. |
| `attendanceRate` | Mede a proporção de mentorias realizadas em relação às mentorias concluídas ou perdidas. | Mediana da coluna. |
| `mentorshipUsage` | Mede quanto o aluno utiliza das mentorias disponíveis para seu tempo de matrícula. | Não possui nulos. |
| `simulationsTaken` | Mede a participação em simulados. | Não possui nulos. |
| `avgCorrectRate` | Resume o acerto médio das quatro áreas dos simulados. | Mediana da coluna. |
| `avgEssayScore` | Mede o desempenho médio nas redações. | Mediana da coluna. |

Os nulos possuem significado de ausência de atividade, assim, eles não foram substituídos diretamente por zero, pois zero poderia significar atividade realizada com desempenho/quantidade igual a zero.

As features foram padronizadas com `StandardScaler`, porque possuem escalas diferentes. Por exemplo, `daysSinceLastActivity` pode chegar a centenas de dias, enquanto taxas de acerto variam entre 0 e 1.

## 3. Escolha de k

| k | Inércia | Silhouette |
|---:|---:|---:|
| 2 | 4351,49 | 0,3895 |
| 3 | 3759,48 | 0,3733 |
| 4 | 3223,23 | 0,2217 |
| 5 | 2911,36 | 0,2128 |
| 6 | 2715,18 | 0,1777 |
| 7 | 2522,52 | 0,1839 |
| 8 | 2374,61 | 0,1828 |

Sem informar `--k`, o script começa com `k=3` e aumenta o número de clusters enquanto a redução da inércia for de pelo menos 10%.

A redução da inércia de `k=3` para `k=4` foi de aproximadamente 14,3%. De `k=4` para `k=5`, a redução foi de aproximadamente 9,7%, abaixo do limite definido. Por isso, a regra escolheu `k=4`.

Após analisar `k=3`, `k=4` foi escolhido por apresentar maior distinção prática entre os grupos, separando melhor alunos focados em provas, mentorias, sem atividade e em queda de engajamento.

A silhouette foi maior em `k=2` e, entre os valores de 3 a 6, foi maior em `k=3`. Mesmo assim, `k=4` foi escolhido porque representa melhor o cotovelo observado na inércia e separa grupos com comportamentos úteis para o time de Sucesso do Aluno: alunos com foco em provas, alunos sem atividade, alunos mais ligados às mentorias e alunos em queda de engajamento.

## 4. Clusters

A média geral da base é utilizada entre parênteses.

| Cluster | Tamanho | Média 1 (geral) | Média 2 (geral) | Média 3 (geral) | Ação para o CS |
|---|---:|---|---|---|---|
| Foco em provas e redações | 349 (34,9%) | 11,73 simulados (6,97) | Nota de redação 805,59 (724,14) | 8,75 dias sem atividade (19,30) | Oferecer acompanhamento acadêmico avançado e metas de provas e redações. |
| Sem atividade registrada | 46 (4,6%) | 260,63 dias de matrícula (178,40) | 0,07 simulados (6,97) | 3,02 faltas em mentorias (0,85) | Fazer contato de reativação e investigar as barreiras para o início das atividades. |
| Foco em mentorias | 341 (34,1%) | 13,85 aulas em 30 dias (9,64) | 6,54 dias sem atividade (19,30) | Nota de redação 693,36 (724,14) | Manter o vínculo das mentorias e estimular a realização de simulados e redações. |
| Engajamento em queda | 264 (26,4%) | 51,78 dias sem atividade (19,30) | 1,23 aulas em 30 dias (9,64) | 1,84 simulados (6,97) | Criar uma campanha de reengajamento com contato prioritário. |

## 5. Tabela cruzada cluster × perfil plantado

| Cluster | Pf1_Engaged | Pf2_Inactive | Pf3_Academic | Pf4_Mentorship | Pf5_Sporadic |
|---:|---:|---:|---:|---:|---:|
| 0 | 120 | 0 | 219 | 10 | 0 |
| 1 | 0 | 44 | 0 | 0 | 2 |
| 2 | 143 | 6 | 26 | 142 | 24 |
| 3 | 0 | 137 | 1 | 1 | 125 |

O cluster 0 concentra principalmente o perfil `Pf3_Academic`, relacionado a muitos simulados, redações e alto desempenho.

O cluster 1 concentra quase totalmente o perfil `Pf2_Inactive`, representando alunos sem atividade registrada.

O cluster 2 mistura os perfis `Pf1_Engaged` e `Pf4_Mentorship`, pois ambos possuem atividade recente, mas diferem na ênfase entre desempenho acadêmico e mentorias.

O cluster 3 mistura os perfis `Pf2_Inactive` e `Pf5_Sporadic`, pois ambos apresentam baixa atividade, mais faltas e poucos simulados.

**Limitação:** o KMeans cria grupos rígidos baseados em distância, e a imputação pela mediana pode reduzir diferenças entre alunos sem atividade. Para reduzir essa limitação, seria possível testar outros algoritmos, utilizar mais dados históricos ou aplicar estratégias de imputação específicas para cada tipo de ausência.
