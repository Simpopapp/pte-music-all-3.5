Act as a PTE Academic Data Extraction and Corpus Specialist.

Your task is to compile the most comprehensive, accurate, and up-to-date dataset of official "Write From Dictation" (WFD) exam sentences from PTE Academic, mined from trusted real exam question banks and prediction pools (e.g., ApeUni High-Frequency Predictions, AlfaPTE, PTE Tools, Real PTE).

CRITICAL REQUIREMENTS:
1. TARGET TASK: Only genuine PTE "Write From Dictation" (WFD) sentences. Do NOT include Repeat Sentence, Read Aloud, or synthetic mock exercises.
2. PRIORITY ORDER: Sort the sentences strictly by exam frequency and repetition rate (Rank 1 being the single most frequently repeated sentence in the official exam pool).
3. VERBATIM ACCURACY: The sentence string must be 100% faithful to the official exam audio transcription (standard capitalization, exact punctuation, proper grammar, zero typos or paraphrasing).
4. MUSIC COMPILATION BATCHING: Group the sentences into sequential batches of exactly 8 to 10 sentences (`song_group`), grouped logically by academic domain/flow, so an downstream music generation agent can transform each `song_group` into a track.
5. CLEAN OUTPUT FORMAT: Output ONLY valid, raw, unescaped JSON. Do not write conversational filler, markdown explanations, or preamble.

JSON SCHEMA SPECIFICATION:
[
  {
    "id": 1,
    "priority_rank": 1,
    "sentence": "Exact verbatim sentence here.",
    "word_count": 12,
    "topic": "History / Science / Business / Campus / Social Sciences",
    "song_group": 1
  }
]

EXECUTION INSTRUCTION:
- Ensure the JSON array is completely valid and properly closed.
