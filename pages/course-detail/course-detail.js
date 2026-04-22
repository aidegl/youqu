// pages/course-detail/course-detail.js

Page({
  data: {
    navHeight: 0,
    courseId: 0,
    course: null,
    chapters: [],
    currentChapter: 0,
    currentChapterData: null,
    isLearning: false,
    examMode: false,
    examQuestions: [],
    examAnswers: [],
    examScore: 0,
    showExamResult: false,
    // 计算属性
    completedChapters: 0,
    totalChapters: 0,
    progressPercent: 0,
    allChaptersCompleted: false,
    optionLabels: ['A', 'B', 'C', 'D']
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const navHeight = systemInfo.statusBarHeight + 44;
    this.setData({ navHeight, courseId: options.id || 1 });

    this.loadCourseData();
  },

  loadCourseData() {
    // 课程数据
    const coursesData = {
      1: {
        title: '公司规章制度',
        icon: '📋',
        desc: '了解公司基本规章制度和员工行为准则',
        duration: '45分钟',
        chapters: [
          {
            id: 1,
            title: '第一章 公司简介',
            content: '友趣科技有限公司成立于2020年，是一家专注于校园社区服务的高新技术企业。公司秉承"连接校园，服务同学"的理念，致力于为大学生提供便捷、高效的校园生活服务。\n\n公司核心价值观：\n• 用户至上 - 以用户需求为核心\n• 创新驱动 - 持续技术创新\n• 团队协作 - 共创共享共赢\n•诚信正直 - 坚守职业道德',
            duration: '10分钟',
            completed: true
          },
          {
            id: 2,
            title: '第二章 工作时间与考勤',
            content: '一、工作时间\n\n标准工作时间：周一至周五 9:00-18:00\n午休时间：12:00-13:00\n弹性工作时间：可根据项目需求申请弹性工作\n\n二、考勤制度\n\n1. 上班打卡：每日上班需在9:00前完成打卡\n2. 下班打卡：每日下班需在18:00后完成打卡\n3. 迟早退：迟到30分钟以内记为迟到，超过30分钟记为旷工半天\n4. 请假流程：提前3天提交请假申请，经部门主管审批后生效\n5. 病假：凭医院证明可申请病假，工资按80%发放',
            duration: '15分钟',
            completed: true
          },
          {
            id: 3,
            title: '第三章 行为准则',
            content: '一、职业道德\n\n1. 保守公司机密，不泄露客户信息\n2. 禁止利用职务之便谋取私利\n3. 不得收受客户或供应商的贿赂\n4. 尊重同事，不进行人身攻击或歧视\n\n二、办公规范\n\n1. 保持办公环境整洁安静\n2. 工作时间不处理私人事务\n3. 禁止在办公区域吸烟、饮酒\n4. 正确使用公司设备和资源\n\n三、着装要求\n\n1. 工作时间穿着得体、整洁\n2. 客户接待时需穿正装\n3. 禁止穿拖鞋、短裤进入办公区',
            duration: '10分钟',
            completed: true
          },
          {
            id: 4,
            title: '第四章 薪酬福利',
            content: '一、薪酬结构\n\n基本工资 + 绩效奖金 + 项目奖金 + 年终奖\n\n薪酬发放时间：每月15日发放上月工资\n\n二、福利待遇\n\n1. 五险一金：养老、医疗、失业、工伤、生育保险 + 公积金\n2. 商业保险：公司为员工购买商业医疗保险\n3. 带薪年假：入职满1年享受5天年假\n4. 节日福利：春节、中秋、端午等节日发放福利\n5. 健康体检：每年一次免费体检\n6. 团建活动：每季度一次团建',
            duration: '10分钟',
            completed: false
          }
        ],
        examQuestions: [
          {
            id: 1,
            question: '公司的标准工作时间是？',
            options: ['8:00-17:00', '9:00-18:00', '10:00-19:00', '弹性时间'],
            answer: 1
          },
          {
            id: 2,
            question: '迟到超过30分钟如何处理？',
            options: ['记为迟到', '记为旷工半天', '扣除当天工资', '需要补签'],
            answer: 1
          },
          {
            id: 3,
            question: '请假需要提前多久申请？',
            options: ['当天', '提前1天', '提前3天', '提前一周'],
            answer: 2
          },
          {
            id: 4,
            question: '入职满1年享受多少天年假？',
            options: ['3天', '5天', '7天', '10天'],
            answer: 1
          },
          {
            id: 5,
            question: '以下哪项属于职业道德要求？',
            options: ['穿正装上班', '保守公司机密', '按时打卡', '保持办公整洁'],
            answer: 1
          }
        ]
      },
      2: {
        title: '安全培训',
        icon: '🛡️',
        desc: '工作场所安全知识和应急处理流程',
        duration: '60分钟',
        chapters: [
          {
            id: 1,
            title: '第一章 办公区安全',
            content: '一、用电安全\n\n1. 不私拉电线，不使用大功率电器\n2. 下班时关闭电脑、显示器等设备\n3. 发现电器异常及时报告\n4. 禁止在电源附近堆放易燃物\n\n二、消防安全\n\n1. 禁止在办公区吸烟\n2. 了解灭火器位置和使用方法\n3. 熟悉紧急出口位置\n4. 定期参加消防演练\n\n三、设备安全\n\n1. 正确使用办公设备\n2. 不擅自拆卸电器设备\n3. 发现设备故障及时报修',
            duration: '15分钟',
            completed: true
          },
          {
            id: 2,
            title: '第二章 网络安全',
            content: '一、密码安全\n\n1. 设置复杂密码（8位以上，含字母数字符号）\n2. 定期更换密码（每90天）\n3. 不同系统使用不同密码\n4. 不与他人分享密码\n\n二、数据安全\n\n1. 重要数据定期备份\n2. 不在公共网络传输敏感信息\n3. 使用公司指定存储工具\n4. 禁止私自拷贝客户数据\n\n三、邮件安全\n\n1. 不打开陌生邮件附件\n2. 不点击可疑链接\n3. 验证邮件发送者身份\n4. 重要邮件加密发送',
            duration: '20分钟',
            completed: false
          },
          {
            id: 3,
            title: '第三章 应急处理',
            content: '一、火灾应急\n\n1. 发现火情立即拨打119并通知安保\n2. 小火可用灭火器扑灭\n3. 大火立即撤离，不要贪恋财物\n4. 撤离时走安全通道，不乘电梯\n5. 无法撤离时躲在安全区域等待救援\n\n二、地震应急\n\n1. 地震时躲在桌子下保护头部\n2. 震后有序撤离，不乘电梯\n3. 在室外远离建筑物、电线\n4. 不在楼梯、走廊停留\n\n三、急救知识\n\n1. 学习基本心肺复苏（CPR）\n2. 了解止血包扎方法\n3. 熟悉公司急救箱位置\n4. 严重情况立即拨打120',
            duration: '25分钟',
            completed: false
          }
        ],
        examQuestions: [
          {
            id: 1,
            question: '密码更换周期是？',
            options: ['每月', '每90天', '每半年', '每年'],
            answer: 1
          },
          {
            id: 2,
            question: '火灾撤离时应该？',
            options: ['乘坐电梯', '走安全通道', '等待救援', '从窗户跳下'],
            answer: 1
          },
          {
            id: 3,
            question: '以下哪项是用电安全要求？',
            options: ['可使用大功率电器', '下班关闭设备', '私拉电线', '堆放易燃物'],
            answer: 1
          },
          {
            id: 4,
            question: '发现火情第一步应？',
            options: ['扑灭火灾', '撤离现场', '拨打119并通知安保', '收拾财物'],
            answer: 2
          },
          {
            id: 5,
            question: '重要数据应该如何处理？',
            options: ['定期备份', '随意删除', '私人拷贝', '公开分享'],
            answer: 0
          }
        ]
      },
      3: {
        title: '业务流程培训',
        icon: '📊',
        desc: '核心业务流程和操作规范',
        duration: '90分钟',
        chapters: [
          {
            id: 1,
            title: '第一章 产品概述',
            content: '一、产品定位\n\n友趣校园社区小程序是面向大学生的综合服务平台，主要功能包括：\n\n• 校园资讯发布与浏览\n• 任务悬赏与接取\n• 同校问答交流\n• 同城活动组织\n\n二、目标用户\n\n主要用户群体为在校大学生，年龄18-25岁，需求包括：\n\n1. 获取校园最新资讯\n2. 发布求助任务\n3. 参与校园活动\n4. 社交交友\n\n三、核心价值\n\n连接校园资源，促进同学互助，打造温暖校园社区。',
            duration: '20分钟',
            completed: true
          },
          {
            id: 2,
            title: '第二章 用户服务流程',
            content: '一、用户注册流程\n\n1. 用户打开小程序\n2. 微信授权登录\n3. 补充个人资料\n4. 完成身份认证\n\n二、内容发布流程\n\n1. 用户点击发布按钮\n2. 选择内容类型（资讯/任务/问答/活动）\n3. 填写内容详情\n4. 添加图片附件\n5. 提交审核\n6. 审核通过后发布\n\n三、任务处理流程\n\n1. 任务发布者发起任务\n2. 其他用户浏览任务列表\n3. 用户申请接取任务\n4. 发布者确认接取人\n5. 执行任务并上传结果\n6. 发布者验收确认\n7. 完成评价与结算',
            duration: '30分钟',
            completed: false
          },
          {
            id: 3,
            title: '第三章 审核规范',
            content: '一、内容审核标准\n\n禁止发布内容：\n\n1. 违法违规信息\n2. 虚假诈骗信息\n3. 低俗暴力内容\n4. 广告推销内容\n5. 侵权盗版内容\n\n二、任务审核要点\n\n1. 任务描述是否清晰\n2. 资金来源是否合法\n3. 任务是否涉及违规\n4. 资金金额是否合理\n\n三、处理时限\n\n• 普通内容：24小时内审核\n• 紧急任务：4小时内审核\n• 违规内容：立即下架处理',
            duration: '20分钟',
            completed: false
          },
          {
            id: 4,
            title: '第四章 客户服务',
            content: '一、服务标准\n\n1. 及时响应：消息24小时内回复\n2. 专业解答：准确解答用户问题\n3. 礼貌沟通：使用规范用语\n4. 问题跟进：复杂问题持续跟进\n\n二、常见问题处理\n\n• 登录问题：引导重新授权\n• 发布失败：检查内容合规性\n• 任务纠纷：协调双方沟通\n• 资金问题：核实后及时处理\n\n三、投诉处理流程\n\n1. 接收投诉信息\n2. 初步核实情况\n3. 联系相关方了解详情\n4. 提出解决方案\n5. 执行并跟踪结果\n6. 反馈处理结果',
            duration: '20分钟',
            completed: false
          }
        ],
        examQuestions: [
          {
            id: 1,
            question: '产品主要目标用户是？',
            options: ['中小学生', '大学生', '职场人士', '老年人'],
            answer: 1
          },
          {
            id: 2,
            question: '普通内容审核时限是？',
            options: ['4小时', '12小时', '24小时', '48小时'],
            answer: 2
          },
          {
            id: 3,
            question: '以下哪项是禁止发布内容？',
            options: ['校园资讯', '学习求助', '虚假诈骗信息', '活动通知'],
            answer: 2
          },
          {
            id: 4,
            question: '消息回复时限是？',
            options: ['12小时', '24小时', '48小时', '72小时'],
            answer: 1
          },
          {
            id: 5,
            question: '任务结算是在哪个步骤之后？',
            options: ['申请接取', '执行任务', '验收确认', '发布任务'],
            answer: 2
          }
        ]
      },
      4: {
        title: '团队协作',
        icon: '👥',
        desc: '团队沟通技巧和协作工具使用',
        duration: '50分钟',
        chapters: [
          {
            id: 1,
            title: '第一章 高效沟通',
            content: '一、沟通基本原则\n\n1. 及时性：信息及时传递，不拖延\n2. 准确性：表达清晰，避免歧义\n3. 完整性：信息完整，不遗漏关键点\n4. 尊重性：尊重对方，不打断发言\n\n二、有效沟通技巧\n\n• 倾听：认真听完对方表述\n• 确认：确认理解是否正确\n• 反馈：及时给予回应\n• 记录：重要信息及时记录\n\n三、沟通渠道选择\n\n• 紧急事项：电话或面对面\n• 日常沟通：企业微信群\n• 正式通知：邮件\n• 项目讨论：会议',
            duration: '15分钟',
            completed: false
          },
          {
            id: 2,
            title: '第二章 会议规范',
            content: '一、会议前准备\n\n1. 明确会议目的和议题\n2. 提前发送会议通知\n3. 准备会议材料\n4. 确定参会人员\n\n二、会议中规范\n\n1. 按时参会，不迟到\n2. 积极参与讨论\n3. 发言简明扼要\n4. 做好会议记录\n5. 手机静音或关闭\n\n三、会议后跟进\n\n1. 整理会议纪要\n2. 明确行动项责任人\n3. 设定完成时限\n4. 跟踪执行进度',
            duration: '15分钟',
            completed: false
          },
          {
            id: 3,
            title: '第三章 协作工具',
            content: '一、项目管理工具\n\n使用企业微信项目管理功能：\n\n• 创建项目任务\n• 分配责任人\n• 设定截止时间\n• 跟踪完成进度\n• 任务提醒通知\n\n二、文档协作\n\n• 使用云文档共同编辑\n• 版本管理避免混乱\n• 评论功能沟通反馈\n• 权限设置保护数据\n\n三、日程管理\n\n• 共享日历安排会议\n• 提醒功能避免遗忘\n• 合理规划工作时间\n• 定期回顾调整计划',
            duration: '20分钟',
            completed: false
          }
        ],
        examQuestions: [
          {
            id: 1,
            question: '紧急事项应该使用什么沟通方式？',
            options: ['邮件', '企业微信群', '电话或面对面', '文档'],
            answer: 2
          },
          {
            id: 2,
            question: '会议通知应该提前发送？',
            options: ['当天', '提前1天', '提前3天', '提前一周'],
            answer: 1
          },
          {
            id: 3,
            question: '以下哪项是沟通基本原则？',
            options: ['随意发言', '及时性', '打断对方', '信息遗漏'],
            answer: 1
          },
          {
            id: 4,
            question: '会议后第一件事是？',
            options: ['离开会议室', '整理会议纪要', '讨论问题', '安排下次会议'],
            answer: 1
          },
          {
            id: 5,
            question: '云文档协作时应该？',
            options: ['随意编辑', '版本管理', '取消权限', '单独操作'],
            answer: 1
          }
        ]
      },
      5: {
        title: '产品知识',
        icon: '📦',
        desc: '公司产品线介绍和核心功能',
        duration: '70分钟',
        chapters: [
          {
            id: 1,
            title: '第一章 产品架构',
            content: '一、系统架构\n\n友趣小程序采用前后端分离架构：\n\n前端：微信小程序\n• 使用微信原生框架\n• 页面渲染高效流畅\n• 支持实时消息推送\n\n后端：明道云平台\n• 数据存储与管理\n• 业务流程自动化\n• 权限控制与审核\n\n二、技术特点\n\n• 云开发，无需自建服务器\n• 弹性扩展，支持高并发\n• 安全可靠，数据加密传输',
            duration: '20分钟',
            completed: false
          },
          {
            id: 2,
            title: '第二章 功能模块',
            content: '一、首页模块\n\n功能说明：展示校园资讯、热门内容\n\n• 轮播图展示重要活动\n• 分类浏览（资讯/任务/问答/吐槽）\n• 内容卡片式展示\n• 支持点赞评论互动\n\n二、发布模块\n\n功能说明：用户发布各类内容\n\n• 内容类型选择\n• 图片上传（最多9张）\n• 任务悬赏设置\n• 分类标签选择\n\n三、消息模块\n\n功能说明：用户沟通与通知\n\n• 任务对话聊天\n• 评论消息通知\n• 点赞消息通知\n• 系统公告推送',
            duration: '25分钟',
            completed: false
          },
          {
            id: 3,
            title: '第三章 用户体系',
            content: '一、用户注册\n\n流程：微信授权 → 获取openid → 创建用户记录\n\n用户数据：\n• openid：微信唯一标识\n• nickname：用户昵称\n• avatar：用户头像\n• created_at：注册时间\n\n二、用户关系\n\n• 关注/粉丝关系\n• 个人空间展示\n• 内容关联显示\n\n三、权限等级\n\n• 普通用户：基本功能\n• 活跃用户：更多发布权限\n• 管理员：内容审核权限',
            duration: '25分钟',
            completed: false
          }
        ],
        examQuestions: [
          {
            id: 1,
            question: '后端使用什么平台？',
            options: ['阿里云', '腾讯云', '明道云', '自建服务器'],
            answer: 2
          },
          {
            id: 2,
            question: '发布图片最多几张？',
            options: ['3张', '6张', '9张', '不限'],
            answer: 2
          },
          {
            id: 3,
            question: '用户唯一标识是什么？',
            options: ['昵称', '手机号', 'openid', '用户ID'],
            answer: 2
          },
          {
            id: 4,
            question: '以下哪个是首页功能？',
            options: ['发布内容', '分类浏览', '用户注册', '任务结算'],
            answer: 1
          },
          {
            id: 5,
            question: '消息模块支持什么？',
            options: ['发布内容', '任务对话聊天', '图片上传', '审核管理'],
            answer: 1
          }
        ]
      }
    };

    const course = coursesData[this.data.courseId] || coursesData[1];
    this.setData({
      course: course,
      chapters: course.chapters,
      examQuestions: course.examQuestions
    });
    this.calculateStats();
  },

  // 计算学习进度统计
  calculateStats() {
    const chapters = this.data.chapters;
    const completed = chapters.filter(c => c.completed).length;
    const total = chapters.length;
    this.setData({
      completedChapters: completed,
      totalChapters: total,
      progressPercent: Math.round((completed / total) * 100),
      allChaptersCompleted: completed === total
    });
  },

  // 开始学习某个章节
  startChapter(e) {
    const chapterId = e.currentTarget.dataset.id;
    const chapter = this.data.chapters.find(c => c.id === chapterId);
    if (chapter) {
      this.setData({
        isLearning: true,
        currentChapter: chapterId,
        currentChapterData: chapter
      });
    }
  },

  // 返回课程列表
  backToCourse() {
    this.setData({
      isLearning: false,
      currentChapter: 0,
      currentChapterData: null
    });
  },

  // 完成当前章节学习
  completeChapter() {
    const chapters = this.data.chapters;
    const currentChapter = this.data.currentChapter;
    const chapter = chapters.find(c => c.id === currentChapter);
    if (chapter) {
      chapter.completed = true;
      this.setData({ chapters });
      this.calculateStats();

      // 检查是否全部完成
      if (this.data.allChaptersCompleted) {
        wx.showToast({
          title: '恭喜完成全部学习！',
          icon: 'success',
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '章节已完成',
          icon: 'success'
        });
        this.setData({ isLearning: false });
      }
    }
  },

  // 开始考试
  startExam() {
    if (!this.data.allChaptersCompleted) {
      wx.showToast({
        title: '请先完成所有章节学习',
        icon: 'none'
      });
      return;
    }

    this.setData({
      examMode: true,
      examAnswers: [],
      showExamResult: false
    });
  },

  // 选择答案
  selectAnswer(e) {
    const { qid, aid } = e.currentTarget.dataset;
    const examAnswers = this.data.examAnswers;
    examAnswers[qid] = aid;
    this.setData({ examAnswers });
  },

  // 提交考试
  submitExam() {
    const questions = this.data.examQuestions;
    const answers = this.data.examAnswers;

    // 检查是否全部作答
    if (answers.length < questions.length) {
      wx.showToast({
        title: '请完成所有题目',
        icon: 'none'
      });
      return;
    }

    // 计算分数
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score += 20;
      }
    });

    this.setData({
      examScore: score,
      showExamResult: true
    });

    // 80分以上通过
    if (score >= 80) {
      wx.showToast({
        title: '考试通过！',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '考试未通过，请重新学习',
        icon: 'none'
      });
    }
  },

  // 重新考试
  retryExam() {
    this.setData({
      examAnswers: [],
      showExamResult: false
    });
  },

  // 返回培训首页
  goBack() {
    wx.navigateBack();
  }
});