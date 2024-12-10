from datetime import datetime
import faiss
import numpy as np
from typing import List, Dict
from bson import ObjectId
import logging

class VectorSearchManager:
    def __init__(self):
        self.dimension = 1536  # text-embedding-3-small dimension
        self.index = None
        self.course_ids = []
        self.last_update = None
        
    async def build_index(self, course_collection) -> None:
        logging.info("Starting to build vector search index...")
        
        courses = await course_collection.find(
            {"title_embedding": {"$exists": True}},
            {"_id": 1, "title_embedding": 1}
        ).to_list(length=None)
        
        if not courses:
            logging.warning("No courses found with embeddings")
            return
            
        logging.info(f"Found {len(courses)} courses with embeddings")
            
        # Extract embeddings and IDs
        embeddings = []
        self.course_ids = []
        
        for course in courses:
            if course.get('title_embedding'):
                embeddings.append(course['title_embedding'])
                self.course_ids.append(str(course['_id']))
        
        if not embeddings:
            logging.warning("No valid embeddings found")
            return
            
        logging.info(f"Building index with {len(embeddings)} embeddings")
            
        # Convert to numpy array
        embeddings_array = np.array(embeddings, dtype=np.float32)
        
        # Build FAISS index
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(embeddings_array)
        
        self.last_update = datetime.now()
        logging.info("Vector search index built successfully")

    async def search(self, query_vector: List[float], k: int = 10) -> List[Dict]:
        if not self.index:
            return []
            
        # Prepare query vector
        query_array = np.array([query_vector], dtype=np.float32)
        
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