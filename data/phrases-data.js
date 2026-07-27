/* 同等学力英语 · 高频词组 */
/* 每条：[词组, 音标, 中文释义, [[例句英文, 例句中文], ...]] */
const PHRASES_DATA = [
  ['account for', '/əˈkaʊnt fɔːr/', '解释，说明；占（比例）', [
    ['The extra costs account for the price increase.', '额外的成本解释了价格上涨的原因。'],
    ['Women account for nearly half of all doctors.', '女性占所有医生的比例接近一半。']
  ]],
  ['take into account', '/teɪk ˈɪntu əˈkaʊnt/', '考虑到，顾及', [
    ['We must take into account the patient age.', '我们必须把病人的年龄考虑在内。'],
    ['The report takes into account recent research.', '这份报告考虑了最近的研究。']
  ]],
  ['in terms of', '/ɪn tɜːrmz əv/', '就……而言，在……方面', [
    ['The job is attractive in terms of salary.', '这份工作在薪资方面很有吸引力。'],
    ['In terms of safety, the new method is better.', '就安全性而言，新方法更好。']
  ]],
  ['be concerned with', '/bi kənˈsɜːrnd wɪð/', '与……有关，涉及', [
    ['This book is concerned with child health.', '这本书是关于儿童健康的。'],
    ['The study is concerned with old age.', '这项研究涉及老年问题。']
  ]],
  ['be concerned about', '/bi kənˈsɜːrnd əˈbaʊt/', '关心，担忧', [
    ['We are concerned about his health.', '我们很担心他的健康。'],
    ['Doctors are concerned about the spread.', '医生们担心疾病的传播。']
  ]],
  ['contribute to', '/kənˈtrɪbjuːt tuː/', '有助于，促成；贡献', [
    ['Exercise contributes to good health.', '运动有助于健康。'],
    ['Smoking contributes to heart disease.', '吸烟会导致心脏病。']
  ]],
  ['result in', '/rɪˈzʌlt ɪn/', '导致，结果是', [
    ['The accident resulted in three injuries.', '这起事故导致三人受伤。'],
    ['Lack of sleep can result in mistakes.', '睡眠不足会导致错误。']
  ]],
  ['result from', '/rɪˈzʌlt frəm/', '由……引起，源于', [
    ['The crisis resulted from poor planning.', '这场危机源于糟糕的规划。'],
    ['His illness resulted from overwork.', '他的病是过度劳累引起的。']
  ]],
  ['lead to', '/liːd tuː/', '导致，通向', [
    ['Stress can lead to illness.', '压力会导致疾病。'],
    ['Hard work leads to success.', '努力会通向成功。']
  ]],
  ['be attributed to', '/bi əˈtrɪbjuːtɪd tuː/', '归因于，归功于', [
    ['The success is attributed to teamwork.', '成功归功于团队合作。'],
    ['The fire was attributed to a fault.', '这场火灾被归因于一处故障。']
  ]],
  ['in spite of', '/ɪn spaɪt əv/', '尽管，不顾', [
    ['In spite of the rain, they went out.', '尽管下雨，他们还是出门了。'],
    ['He finished in spite of the pain.', '尽管疼痛，他还是完成了。']
  ]],
  ['on the basis of', '/ɑːn ðə ˈbeɪsɪs əv/', '根据，在……基础上', [
    ['Judgments are made on the basis of facts.', '判断是基于事实做出的。'],
    ['We act on the basis of evidence.', '我们根据证据行事。']
  ]],
  ['with respect to', '/wɪð rɪˈspekt tuː/', '关于，就……而言', [
    ['With respect to cost, the plan is fair.', '关于成本，这个方案是公平的。'],
    ['He spoke with respect to the new law.', '他就新法律发表了讲话。']
  ]],
  ['in contrast to', '/ɪn ˈkɑːntræst tuː/', '与……形成对比', [
    ['In contrast to last year, sales rose.', '与去年相比，销售额上升了。'],
    ['In contrast to the city, the town is quiet.', '与城市不同，这个小镇很安静。']
  ]],
  ['be superior to', '/bi səˈpɪriər tuː/', '优于，胜过', [
    ['This method is superior to the old one.', '这种方法优于旧方法。'],
    ['Her skill is superior to mine.', '她的技术比我高超。']
  ]],
  ['be inferior to', '/bi ɪnˈfɪriər tuː/', '劣于，不如', [
    ['The copy is inferior to the original.', '复制品不如原作。'],
    ['His work is inferior to theirs.', '他的工作不如他们的。']
  ]],
  ['adapt to', '/əˈdæpt tuː/', '适应', [
    ['Plants adapt to their environment.', '植物适应它们的环境。'],
    ['Children adapt to change quickly.', '孩子能很快适应变化。']
  ]],
  ['adjust to', '/əˈdʒʌst tuː/', '适应，调整', [
    ['It takes time to adjust to a new job.', '适应一份新工作需要时间。'],
    ['He adjusted to life abroad.', '他适应了国外的生活。']
  ]],
  ['apply to', '/əˈplaɪ tuː/', '适用于；申请', [
    ['These rules apply to all students.', '这些规则适用于所有学生。'],
    ['The law applies to everyone.', '这条法律对每个人都适用。']
  ]],
  ['approve of', '/əˈpruːv əv/', '赞成，同意', [
    ['Her parents approve of her choice.', '她父母赞成她的选择。'],
    ['We approve of the new plan.', '我们赞成这个新计划。']
  ]],
  ['be aware of', '/bi əˈwer əv/', '意识到，知道', [
    ['Be aware of the risks involved.', '要意识到其中的风险。'],
    ['He was aware of the problem.', '他意识到了这个问题。']
  ]],
  ['benefit from', '/ˈbenɪfɪt frəm/', '从……中受益', [
    ['Patients benefit from early care.', '病人从早期护理中受益。'],
    ['The poor benefit from the fund.', '穷人从这个基金中受益。']
  ]],
  ['cope with', '/koʊp wɪð/', '应付，处理（困难）', [
    ['She found it hard to cope with the stress.', '她发现很难应对这种压力。'],
    ['We must cope with the change.', '我们必须应对这一变化。']
  ]],
  ['deal with', '/diːl wɪð/', '处理，对付；涉及', [
    ['The book deals with modern art.', '这本书讲述现代艺术。'],
    ['He knows how to deal with conflict.', '他懂得如何处理冲突。']
  ]],
  ['be engaged in', '/bi ɪnˈɡeɪdʒd ɪn/', '从事，忙于', [
    ['He is engaged in medical research.', '他从事医学研究。'],
    ['They are engaged in a study.', '他们正在进行一项研究。']
  ]],
  ['be involved in', '/bi ɪnˈvɑːlvd ɪn/', '参与，卷入', [
    ['She was involved in the project.', '她参与了这个项目。'],
    ['Many people were involved in the trial.', '很多人参与了这项试验。']
  ]],
  ['be committed to', '/bi kəˈmɪtɪd tuː/', '致力于，承诺', [
    ['The hospital is committed to quality.', '这家医院致力于提升质量。'],
    ['He is committed to his work.', '他致力于自己的工作。']
  ]],
  ['have access to', '/hæv ˈækses tuː/', '可以使用，接近', [
    ['Students have access to the library.', '学生可以使用图书馆。'],
    ['Rural areas have access to care.', '农村地区能获得医疗服务。']
  ]],
  ['be accustomed to', '/bi əˈkʌstəmd tuː/', '习惯于', [
    ['He is accustomed to getting up early.', '他习惯早起。'],
    ['She is accustomed to the noise.', '她习惯了这种噪音。']
  ]],
  ['in accordance with', '/ɪn əˈkɔːrdəns wɪð/', '依据，按照', [
    ['The work was done in accordance with the law.', '这项工作是依照法律完成的。'],
    ['We acted in accordance with the rules.', '我们按照规则行事。']
  ]],
  ['take advantage of', '/teɪk ədˈvæntɪdʒ əv/', '利用', [
    ['We should take advantage of this chance.', '我们应该利用这个机会。'],
    ['Firms take advantage of low costs.', '企业利用低成本获利。']
  ]],
  ['pay attention to', '/peɪ əˈtenʃən tuː/', '注意，留意', [
    ['Pay attention to the details.', '注意细节。'],
    ['Please pay attention to safety.', '请注意安全。']
  ]],
  ['be capable of', '/bi ˈkeɪpəbl əv/', '能够，有能力', [
    ['She is capable of solving the issue.', '她有能力解决这个问题。'],
    ['The system is capable of learning.', '这个系统能够学习。']
  ]],
  ['be responsible for', '/bi rɪˈspɑːnsəbl fɔːr/', '对……负责', [
    ['He is responsible for the delay.', '他要对这次延误负责。'],
    ['Who is responsible for this task?', '谁负责这项任务？']
  ]],
  ['be dependent on', '/bi dɪˈpendənt ɑːn/', '依赖于，取决于', [
    ['The region is dependent on tourism.', '该地区依赖于旅游业。'],
    ['Growth is dependent on trade.', '增长取决于贸易。']
  ]],
  ['have an effect on', '/hæv ən ɪˈfekt ɑːn/', '对……有影响', [
    ['Noise has an effect on sleep.', '噪音会影响睡眠。'],
    ['Diet has an effect on health.', '饮食对健康有影响。']
  ]],
  ['be essential to', '/bi ɪˈsenʃl tuː/', '对……必不可少', [
    ['Water is essential to life.', '水对生命必不可少。'],
    ['Trust is essential to team work.', '信任对团队合作至关重要。']
  ]],
  ['be familiar with', '/bi fəˈmɪliər wɪð/', '熟悉，通晓', [
    ['Are you familiar with this tool?', '你熟悉这个工具吗？'],
    ['She is familiar with the case.', '她对这个病例很熟悉。']
  ]],
  ['focus on', '/ˈfoʊkəs ɑːn/', '集中于，关注', [
    ['We should focus on the main task.', '我们应该专注于主要任务。'],
    ['The talk will focus on health.', '这次讲座将聚焦于健康。']
  ]],
  ['rely on', '/rɪˈlaɪ ɑːn/', '依靠，依赖', [
    ['You can rely on him.', '你可以信赖他。'],
    ['We rely on data, not guesses.', '我们依靠数据，而不是猜测。']
  ]],
  ['be related to', '/bi rɪˈleɪtɪd tuː/', '与……相关', [
    ['Income is related to education.', '收入与教育相关。'],
    ['The pain is related to the injury.', '这种疼痛与那处损伤有关。']
  ]],
  ['in response to', '/ɪn rɪˈspɑːns tuː/', '作为对……的回应', [
    ['In response to the call, we acted.', '作为对号召的回应，我们采取了行动。'],
    ['He laughed in response to the joke.', '作为对那个笑话的回应，他笑了。']
  ]],
  ['be sensitive to', '/bi ˈsensətɪv tuː/', '对……敏感', [
    ['Be sensitive to the needs of others.', '要体察他人的需求。'],
    ['The test is sensitive to change.', '这项检测对变化很敏感。']
  ]],
  ['be similar to', '/bi ˈsɪmələr tuː/', '与……相似', [
    ['This case is similar to the last one.', '这个病例与上一个相似。'],
    ['Their views are similar to mine.', '他们的观点与我相似。']
  ]],
  ['be subject to', '/bi ˈsʌbdʒɪkt tuː/', '易受……的，受……支配', [
    ['Prices are subject to change.', '价格可能变动。'],
    ['The plan is subject to approval.', '该计划须经批准。']
  ]],
  ['take into consideration', '/teɪk ˈɪntu kənˌsɪdəˈreɪʃən/', '考虑到，顾及', [
    ['Take into consideration their experience.', '把他们的经验考虑进去。'],
    ['We take into consideration the cost.', '我们会把成本考虑在内。']
  ]],
  ['be willing to', '/bi ˈwɪlɪŋ tuː/', '愿意，乐意', [
    ['He is willing to help.', '他愿意帮忙。'],
    ['Are you willing to join?', '你愿意加入吗？']
  ]]
];
