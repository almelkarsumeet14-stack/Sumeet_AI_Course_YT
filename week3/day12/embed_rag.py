import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

import numpy as np
from sentence_transformers import SentenceTransformer

def cosine_similarity(vec1, vec2):
   return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

model = SentenceTransformer("all-MiniLM-L6-v2") #arr size = 384
text = "Machine Learning is fun."

# embedding = model.encode(text)
# print(embedding.shape)
# print(embedding[:5])


t1="There are 24 paid leaves."
t2="There are 24 paid leaves."

v1 = model.encode(t1)
v2 = model.encode(t2)
print(cosine_similarity(v1, v2))