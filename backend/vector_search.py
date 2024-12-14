from datetime import datetime
import faiss
import numpy as np
from typing import List, Dict
from bson import ObjectId
import logging
import os
import time

class VectorSearchManager:
    def __init__(self):
        self.dimension = 1536  # text-embedding-3-small dimension
        self.title_index = None
        self.code_index = None
        self.title_course_ids = []
        self.code_course_ids = []
        self.last_update = None
        
    async def build_index(self, course_collection, use_code_embedding: bool = False) -> None:
        start_time = time.time()
        index_type = "code" if use_code_embedding else "title"
        logging.info(f"Starting to build {index_type} vector search index...")
        
        # Try loading cached index
        index_file = f"faiss_{index_type}_index.idx"
        ids_file = f"{index_type}_course_ids.txt"
        
        if os.path.exists(index_file):
            if use_code_embedding:
                self.code_index = faiss.read_index(index_file)
                with open(ids_file, "r") as f:
                    self.code_course_ids = f.read().splitlines()
            else:
                self.title_index = faiss.read_index(index_file)
                with open(ids_file, "r") as f:
                    self.title_course_ids = f.read().splitlines()
            logging.info(f"Loaded cached {index_type} FAISS index.")
            return
        
        # Debug: Print sample document
        sample_doc = await course_collection.find_one({"code_embeddings": {"$exists": True}})
        if sample_doc and use_code_embedding:
            print(f"\nSample document structure:")
            print(f"code_embeddings type: {type(sample_doc.get('code_embeddings'))}")
            print(f"Number of embeddings: {len(sample_doc.get('code_embeddings', []))}")
        
        # Query for embeddings
        embedding_field = "code_embeddings" if use_code_embedding else "title_embedding"
        courses = await course_collection.find(
            {embedding_field: {"$exists": True}},
            {"_id": 1, embedding_field: 1}
        ).to_list(length=None)
        
        if not courses:
            logging.warning(f"No courses found with {index_type} embeddings")
            return
            
        # Extract embeddings and IDs
        embeddings = []
        course_ids = []
        
        print(f"\nProcessing {len(courses)} courses...")
        for course in courses:
            if use_code_embedding:
                # Handle array of code embeddings
                if course.get(embedding_field):
                    for embedding in course[embedding_field]:
                        norm = np.linalg.norm(embedding)
                        if norm > 0:
                            normalized_embedding = embedding / norm
                            embeddings.append(normalized_embedding)
                            course_ids.append(str(course['_id']))
                        else:
                            logging.warning(f"Zero vector encountered for course {course['_id']}")
                    print(f"Added {len(course[embedding_field])} embeddings for course {course['_id']}")
            else:
                # Handle single title embedding
                if course.get(embedding_field):
                    norm = np.linalg.norm(course[embedding_field])
                    if norm > 0:
                        normalized_embedding = course[embedding_field] / norm
                        embeddings.append(normalized_embedding)
                        course_ids.append(str(course['_id']))
                    else:
                        logging.warning(f"Zero vector encountered for course {course['_id']}")
        
        if not embeddings:
            logging.warning(f"No valid {index_type} embeddings found")
            return
            
        print(f"\nTotal embeddings collected: {len(embeddings)}")
        print(f"Unique courses: {len(set(course_ids))}")
        
        # Build FAISS index
        embeddings_array = np.array(embeddings, dtype=np.float32)
        index = faiss.IndexFlatIP(self.dimension)
        index.add(embeddings_array)
        
        # Save index and IDs
        if use_code_embedding:
            self.code_index = index
            self.code_course_ids = course_ids
        else:
            self.title_index = index
            self.title_course_ids = course_ids
            
        self.last_update = datetime.now()
        
        # Cache the index
        faiss.write_index(index, index_file)
        with open(ids_file, "w") as f:
            for course_id in course_ids:
                f.write(f"{course_id}\n")
        
        end_time = time.time()
        logging.info(f"{index_type} vector search index built in {end_time - start_time:.2f} seconds with {len(embeddings)} embeddings")

    async def search(self, query_vector: List[float], k: int = 10, use_code_embedding: bool = False) -> List[Dict]:
        index = self.code_index if use_code_embedding else self.title_index
        course_ids = self.code_course_ids if use_code_embedding else self.title_course_ids
        
        if not index:
            return []
        
        print(f"\nPerforming {'code' if use_code_embedding else 'title'} search...")
        print(f"Total embeddings in index: {index.ntotal}")
        
        # Normalize the query vector
        query_array = np.array(query_vector, dtype=np.float32)
        norm = np.linalg.norm(query_array)
        if norm > 0:
            query_array = query_array / norm
        else:
            logging.warning("Received zero vector as query")
        
        query_array = np.expand_dims(query_array, axis=0)
        
        # Search
        D, I = index.search(query_array, k * 3)  # Search for more results to account for duplicates
        
        # Format results with deduplication
        results_dict = {}
        for distance, idx in zip(D[0], I[0]):
            if idx < len(course_ids):
                course_id = course_ids[idx]
                # Keep the highest similarity score for each course
                if course_id not in results_dict or distance > results_dict[course_id]['similarity']:
                    results_dict[course_id] = {
                        'id': course_id,
                        'similarity': float(distance)
                    }
                    print(f"Course {course_id}: similarity = {distance:.4f}")
        
        # Convert to list and sort by similarity
        results = list(results_dict.values())
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        print(f"\nFound {len(results)} unique courses after deduplication")
        
        # Return only the top k results
        return results[:k]

# Create singleton instance
vector_search = VectorSearchManager()