export const EVALUATION_QUESTIONS = [
  {
    key: 'q1' as const,
    commentKey: 'q1_comment' as const,
    text: '١. ئایا نوێنەری کەسی یەکەمی ئۆرگان ئامادەی پرۆسەی جەرد بوو؟',
  },
  {
    key: 'q2' as const,
    commentKey: 'q2_comment' as const,
    text: '٢. ئایا بەرپرسی دارایی ئۆرگان یان نوێنەری دارایی ئۆرگان ئامادەی پرۆسەی جەرد بوو؟',
  },
  {
    key: 'q3' as const,
    commentKey: 'q3_comment' as const,
    text: '٣. ئایا بەرپرسی موڵك و ماڵی ئۆرگان ئامادەی پرۆسەی جەرد بوو؟',
  },
  {
    key: 'q4' as const,
    commentKey: 'q4_comment' as const,
    text: '٤. ئایا سەرجەم کەل و پەلەکانی ناو ئۆرگان ژمێردران لەم جەردە دا؟',
  },
  {
    key: 'q5' as const,
    commentKey: 'q5_comment' as const,
    text: '٥. ئایا سەرجەم ژوور و کۆگاکانی ناو ئۆرگان سەیر کران لە لایەن کەسی ژمێیارەوە؟',
  },
  {
    key: 'q6' as const,
    commentKey: 'q6_comment' as const,
    text: '٦. ئایا ئەو کەل و پەلانەی کە لەلایەن کادرانی ئۆرگانە دەبرێنەوە بۆ ماڵەوە بۆ ڕایی کردنی ئەرکەکانیان، لە ڕۆژی جەرد دا گەرێنرانەوە بۆ ئۆرگان؟',
  },
  {
    key: 'q7' as const,
    commentKey: 'q7_comment' as const,
    text: '٧. ئایا شوێنی بەکارهێنان و هەڵگرتنی کەل و پەلەکان لە ئۆرگاندا لە ئاستی پێویستدایە؟',
  },
] as const;

export type QuestionKey = (typeof EVALUATION_QUESTIONS)[number]['key'];
export type CommentKey = (typeof EVALUATION_QUESTIONS)[number]['commentKey'];
