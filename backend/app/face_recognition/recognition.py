import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def cosine_score(a, b):
    return float(cosine_similarity(a.reshape(1,-1), b.reshape(1,-1))[0][0])

def find_best_match(target, candidates_dict, threshold=0.5):
    best_id, best_score = None, -1
    for emp_id, emb in candidates_dict.items():
        s = cosine_score(target, emb)
        if s > best_score:
            best_score, best_id = s, emp_id
    if best_score >= threshold:
        return best_id, best_score
    return None, best_score
