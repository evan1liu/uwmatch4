import os
import json
import re
import logging
from typing import Dict, List
import requests
from bs4 import BeautifulSoup
import openai

# Configuration
BATCH_SIZE = 10  # Define batch size globally for consistency

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_departments_from_html(url: str) -> List[Dict[str, str]]:
    """Extract department names and codes from the UW website."""
    logging.info(f"Fetching departments from {url}")
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Error fetching departments: {str(e)}")
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    departments = []
    seen_codes = set()
    pattern = r'(.*?)\s*\((.*?)\)'  # Matches "Any text (CODE)"
    
    for ul in soup.find_all('ul'):
        for li in ul.find_all('li', recursive=False):
            link = li.find('a')
            if link:
                text = link.text.strip()
                match = re.match(pattern, text)
                if match:
                    dept_name, dept_code = match.groups()
                    dept_code = dept_code.strip()
                    dept_name = dept_name.strip()
                    
                    if dept_code not in seen_codes:
                        departments.append({
                            "code": dept_code,
                            "name": dept_name
                        })
                        seen_codes.add(dept_code)
                        logging.info(f"Found department: {dept_code} - {dept_name}")
                    else:
                        logging.warning(f"Duplicate department skipped: {dept_code} - {dept_name}")
    
    logging.info(f"Total departments extracted: {len(departments)}")
    return departments

def get_department_aliases(dept_code: str, dept_name: str) -> List[str]:
    """Use OpenAI to generate department aliases."""
    prompt = f"""Generate at least 15 abbreviations for this university department:

Department Code: {dept_code}
Full Name: {dept_name}

Including:
1. The official code
2. All of the common abbreviations

Format your response as a Python list of strings in UPPERCASE, without any extra strings or formatting."""

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert in university department naming conventions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Extract the list from the response
        response_text = response.choices[0].message.content
        aliases_str = response_text.strip().split('[')[1].split(']')[0]
        aliases = [alias.strip().strip('"').strip("'") for alias in aliases_str.split(',')]
        aliases = [alias for alias in aliases if alias]
        
        # Log aliases
        logging.info(f"{dept_code} - {dept_name} Aliases:")
        logging.info("=" * 50)
        for alias in aliases:
            logging.info(f"  - {alias}")
        logging.info("=" * 50)
        
        return aliases
        
    except openai.error.OpenAIError as e:
        logging.error(f"Error generating aliases for {dept_code}: {str(e)}")
        return [dept_code, dept_name]
    except (IndexError, ValueError) as e:
        logging.error(f"Error parsing aliases for {dept_code}: {str(e)}")
        return [dept_code, dept_name]

def process_department(dept: Dict[str, str], department_mapping: Dict):
    """Process a single department."""
    print(f"Processing: {dept['code']}")
    aliases = get_department_aliases(dept['code'], dept['name'])
    department_mapping[dept['code']] = {
        "code": dept['code'],
        "name": dept['name'],
        "aliases": aliases
    }

def main():
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    url = "https://guide.wisc.edu/courses/"
    departments = extract_departments_from_html(url)
    total_depts = len(departments)
    print(f"Found {total_depts} departments")
    
    if total_depts == 0:
        print("No departments found. Exiting.")
        return
    
    # Create department mapping
    department_mapping = {}
    
    for batch_number, i in enumerate(range(0, total_depts, BATCH_SIZE), start=1):
        current_batch = departments[i:i + BATCH_SIZE]
        print(f"\nBatch {batch_number}:")
        for dept in current_batch:
            print(f"  {dept['code']}")

        for dept in current_batch:
            process_department(dept, department_mapping)
    
    # Save to JSON file
    try:
        with open('department_aliases.json', 'w', encoding='utf-8') as f:
            json.dump(department_mapping, f, indent=2, ensure_ascii=False)
        logging.info(f"\nProcessed {len(department_mapping)} departments and saved to department_aliases.json")
    except IOError as e:
        logging.error(f"Error saving to JSON file: {str(e)}")

if __name__ == "__main__":
    main()