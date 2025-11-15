export type KBItem = {
  question?: string;
  one_liner?: string;
  short_script?: string;
  full_script?: string;
  why?: string;
};

export type CallSearchRow = {
  call_id: string;
  chunk_id: string;
  content: string;
  score: number;
};

export type QAJson = {
  one_liner?: string;
  why?: string;
  ack?: string;
  short_script?: string;
  full_script?: string;
  math?: string;
  next_step?: string;
};
