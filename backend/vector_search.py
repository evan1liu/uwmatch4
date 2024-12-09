from datetime import datetime
import faiss
import numpy as np
from typing import List, Dict
from bson import ObjectId

class VectorSearchManager:
    def __init__(self):
        self.dimension = 1536  # text-embedding-3-small dimension
        self.index = None
        self.course_ids = []
        self.last_update = None
        
    async def build_index(self, course_collection) -> None:
        courses = await course_collection.find(
            {"title_embedding": {"$exists": True}},
            {"_id": 1, "title_embedding": 1}
        ).to_list(length=None)
        
        if not courses:
            return
            
        # Extract embeddings and IDs
        embeddings = []
        self.course_ids = []
        
        for course in courses:
            if course.get('title_embedding'):
                embeddings.append(course['title_embedding'])
                self.course_ids.append(str(course['_id']))
        
        if not embeddings:
            return
            
        # Convert to numpy array
        embeddings_array = np.array(embeddings, dtype=np.float32)
        
        # Build FAISS index
        self.index = faiss.IndexFlatIP(self.dimension)
        faiss.normalize_L2(embeddings_array)
        self.index.add(embeddings_array)
        
        self.last_update = datetime.now()

    async def search(self, query_vector: List[float], k: int = 10) -> List[Dict]:
        if not self.index:
            return []
            
        # Prepare query vector
        query_array = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(query_array)
        
        # Search
        D, I = self.index.search(query_array, k)
        
        # Format results
        results = []
        for i, (distance, idx) in enumerate(zip(D[0], I[0])):
            if idx < len(self.course_ids):
                results.append({
                    'id': self.course_ids[idx],
                    'similarity': float(distance)
                })
        
        return results

# Create singleton instance
vector_search = VectorSearchManager()